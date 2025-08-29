// utils/apiFetch.js (BE)
const fetch = require('node-fetch'); // se Node <18, altrimenti fetch globale
const BASE_URL = process.env.BE_URL || 'http://localhost:3000';

/**
 * apiFetch lato backend
 * - url: endpoint relativo al BASE_URL
 * - options: fetch options
 * - token: opzionale, JWT preso dal DB o dal contesto request
 */
const apiFetch = async (url, options = {}, token = null) => {
  try {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });

    let data;
    try { data = await res.json(); } catch { data = null; }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('Errore in apiFetch BE:', err);
    return { ok: false, status: 0, data: { msg: 'Errore di connessione al server' } };
  }
};

module.exports = apiFetch;
