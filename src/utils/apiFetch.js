// utils/apiFetch.js (BE)
const fetch = require('node-fetch'); // se vuoi fare richieste interne al backend

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });

    let data;
    try { data = await res.json(); } catch { data = null; }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('Errore in apiFetch BE:', err);
    return { ok: false, status: 0, data: { msg: 'Errore di connessione al server' } };
  }
}

module.exports = apiFetch;
