const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiFetch = async (url, options = {}) => {
  try {
    const noCredentials = ['/contact'];
    const sendCredentials = !noCredentials.some(ep => url.startsWith(ep));

    let res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: sendCredentials ? 'include' : 'omit',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });

    // refresh token solo per endpoint autenticati
    if (res.status === 401 && sendCredentials) {
      const refresh = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (refresh.ok) {
        res = await fetch(`${BASE_URL}${url}`, { ...options, credentials: 'include' });
      } else {
        window.location.href = '/login';
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
