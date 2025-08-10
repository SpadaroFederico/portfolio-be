const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// CREATE
router.post('/', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { nome, ente, data_ottenimento, descrizione } = req.body;
  if (!nome || !ente || !data_ottenimento) return res.status(400).json({ message: 'Campi obbligatori mancanti' });

  const query = `INSERT INTO certificazioni (nome, ente, data_ottenimento, descrizione) VALUES (?, ?, ?, ?)`;
  db.query(query, [nome, ente, data_ottenimento, descrizione], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore inserimento certificazione', err });
    res.status(201).json({ message: 'Certificazione creata', id: result.insertId });
  });
});

// READ - pubblico
router.get('/', (req, res) => {
  db.query('SELECT * FROM certificazioni', (err, results) => {
    if (err) return res.status(500).json({ message: 'Errore lettura certificazioni', err });
    res.json(results);
  });
});

// UPDATE
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { id } = req.params;
  const { nome, ente, data_ottenimento, descrizione } = req.body;
  if (!nome || !ente || !data_ottenimento) return res.status(400).json({ message: 'Campi obbligatori mancanti' });

  const query = `UPDATE certificazioni SET nome = ?, ente = ?, data_ottenimento = ?, descrizione = ? WHERE id = ?`;
  db.query(query, [nome, ente, data_ottenimento, descrizione, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore aggiornamento certificazione', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Certificazione non trovata' });
    res.json({ message: 'Certificazione aggiornata' });
  });
});

// DELETE
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { id } = req.params;
  const query = `DELETE FROM certificazioni WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore cancellazione certificazione', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Certificazione non trovata' });
    res.json({ message: 'Certificazione cancellata' });
  });
});

module.exports = router;
