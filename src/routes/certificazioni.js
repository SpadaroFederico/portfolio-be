const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// CREATE
router.post('/', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { titolo, ente, data_conseguimento, descrizione = null, img = null } = req.body;
  if (!titolo || !ente || !data_conseguimento)
    return res.status(400).json({ message: 'Campi obbligatori mancanti' });

  const query = `
    INSERT INTO certificazioni (titolo, ente, data_conseguimento, descrizione, img)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [titolo, ente, data_conseguimento, descrizione, img], (err, result) => {
    if (err) {
      console.error('Errore DB:', err);
      return res.status(500).json({ message: 'Errore inserimento certificazione', err });
    }
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
  const { titolo, ente, data_conseguimento, descrizione = null, img = null } = req.body;
  if (!titolo || !ente || !data_conseguimento)
    return res.status(400).json({ message: 'Campi obbligatori mancanti' });

  const query = `
    UPDATE certificazioni
    SET titolo = ?, ente = ?, data_conseguimento = ?, descrizione = ?, img = ?
    WHERE id = ?
  `;
  db.query(query, [titolo, ente, data_conseguimento, descrizione, img, id], (err, result) => {
    if (err) {
      console.error('Errore aggiornamento certificazione:', err);
      return res.status(500).json({ message: 'Errore aggiornamento certificazione', err });
    }
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
