// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Registrazione
router.post('/register', async (req, res) => {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) {
        return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
    }

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

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
    }

    const query = 'SELECT * FROM utenti WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Errore server', err });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ message: 'Credenziali non valide' });

        const token = jwt.sign({ id: user.id, ruolo: user.ruolo }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login effettuato', token });
    });
});

module.exports = router;
