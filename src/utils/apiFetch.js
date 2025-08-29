// utils/apiFetch.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * apiFetch gestisce fetch con JWT, refresh token e gestione errori.
 * - url: endpoint relativo al BASE_URL
 * - options: { method, headers, body, etc. }
 * - includeCredentials: true se endpoint protetto
 */
export const apiFetch = async (url, options = {}, includeCredentials = true) => {
  try {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    // Invia JWT se presente nel localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && includeCredentials) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Chiamata principale
    let res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: includeCredentials ? 'include' : 'omit',
    });

    // Gestione 401 → refresh token solo se endpoint protetto
    if (res.status === 401 && includeCredentials) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('accessToken', data.accessToken);

        // Retry della richiesta originale con nuovo token
        headers['Authorization'] = `Bearer ${data.accessToken}`;
        res = await fetch(`${BASE_URL}${url}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        // Logout se refresh fallisce
        localStorage.removeItem('accessToken');
        return { ok: false, status: 401, data: { msg: 'Non autorizzato' } };
      }
    }

    let data;
    try { data = await res.json(); } catch { data = null; }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('Errore in apiFetch:', err);
    return { ok: false, status: 0, data: { msg: 'Errore di connessione al server' } };
  }
};
