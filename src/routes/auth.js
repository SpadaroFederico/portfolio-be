// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Helper: crea token
function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}
function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/* ------------------ REGISTER ------------------ */
router.post('/register', async (req, res) => {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password) return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO utenti (nome, email, password_hash) VALUES (?, ?, ?)';
    db.query(query, [nome, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Errore server', err });
      res.status(201).json({ message: 'Utente registrato con successo' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', err });
  }
});

/* ------------------ LOGIN ------------------ */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });

  const query = 'SELECT * FROM utenti WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Errore server', err });
    if (results.length === 0) return res.status(401).json({ message: 'Credenziali non valide' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Credenziali non valide' });

    const payload = { id: user.id, ruolo: user.ruolo };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // salva refreshToken nel DB
    const insert = 'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)';
    db.query(insert, [user.id, refreshToken], (dbErr) => {
      if (dbErr) {
        console.error('DB error saving refresh token', dbErr);
        return res.status(500).json({ message: 'Errore server' });
      }

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
        };

        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({ message: 'Login effettuato' });
    });
  });
});

/* ------------------ REFRESH ------------------ */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token mancante' });

  // verifico che sia presente in DB
  const query = 'SELECT * FROM refresh_tokens WHERE token = ?';
  db.query(query, [refreshToken], (err, results) => {
    if (err) return res.status(500).json({ message: 'Errore server' });
    if (results.length === 0) return res.status(403).json({ message: 'Refresh token non valido' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, payload) => {
      if (err) return res.status(403).json({ message: 'Refresh token non valido o scaduto' });

      const newAccessToken = createAccessToken({ id: payload.id, ruolo: payload.ruolo });

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
        maxAge: 15 * 60 * 1000,
     });

      res.json({ message: 'Access token rinnovato' });
    });
  });
});

/* ------------------ LOGOUT ------------------ */
router.post('/logout', (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken], (err) => {
      if (err) console.error('Errore cancellando refresh token', err);
    });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout effettuato' });
});

/* ------------------ PROTECTED CHECK ------------------ */
router.get('/protected-check', (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: 'Non autorizzato' });

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(403).json({ message: 'Token non valido o scaduto' });
    res.json({ message: 'Autenticato' });
  });
});

module.exports = router;
