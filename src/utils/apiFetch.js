// src/utils/apiFetch.js
export const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401) { // accessToken scaduto
    const refresh = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refresh.ok) {
      // riprova la chiamata originale
      return await fetch(url, { ...options, credentials: 'include' });
    } else {
      // redirect al login
      window.location.href = '/login';
      return null;
    }
  }

  return res;
};
