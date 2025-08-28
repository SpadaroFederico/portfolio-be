const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// CREATE
router.post('/', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  const { titolo, azienda, inizio, fine, descrizione, img } = req.body;
if (!titolo || !azienda || !inizio) {
  return res.status(400).json({ message: 'Campi obbligatori mancanti' });
}

const query = `
  INSERT INTO esperienze (titolo, azienda, inizio, fine, descrizione, img)
  VALUES (?, ?, ?, ?, ?, ?)
`;

db.query(query, [titolo, azienda, inizio, fine, descrizione, img], (err, result) => {
  if (err) {
    return res.status(500).json({ message: 'Errore inserimento esperienza', err });
  }
  res.status(201).json({ message: 'Esperienza creata', id: result.insertId });
});
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM esperienze', (err, results) => {
    if (err) return res.status(500).json({ message: 'Errore lettura esperienze', err });
    res.json(results);
  });
});


// UPDATE
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  const { id } = req.params;
const { titolo, azienda, inizio, fine, descrizione, img } = req.body;
if (!titolo || !azienda || !inizio) {
  return res.status(400).json({ message: 'Campi obbligatori mancanti' });
}

const query = `
  UPDATE esperienze
  SET titolo = ?, azienda = ?, inizio = ?, fine = ?, descrizione = ?, img = ?
  WHERE id = ?
`;

db.query(query, [titolo, azienda, inizio, fine, descrizione, img, id], (err, result) => {
  if (err) {
    return res.status(500).json({ message: 'Errore aggiornamento esperienza', err });
  }
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Esperienza non trovata' });
  }
  res.json({ message: 'Esperienza aggiornata' });
});
});

// DELETE
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { id } = req.params;
  const query = `DELETE FROM esperienze WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore cancellazione esperienza', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Esperienza non trovata' });
    res.json({ message: 'Esperienza cancellata' });
  });
});

module.exports = router;
