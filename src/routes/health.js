// src/routes/health.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// semplice endpoint per testare BE e DB
router.get('/', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('❌ DB non raggiungibile:', err);
      return res.status(500).json({ status: 'error', db: false });
    }
    res.json({ status: 'ok', db: true });
  });
});

module.exports = router;
