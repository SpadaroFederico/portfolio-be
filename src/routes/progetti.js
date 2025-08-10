const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// CREATE - solo admin
router.post('/', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { titolo, descrizione, tecnologie, link_repo, link_demo } = req.body;
  if (!titolo || !descrizione) return res.status(400).json({ message: 'Titolo e descrizione obbligatori' });

  const query = `INSERT INTO progetti (titolo, descrizione, tecnologie, link_repo, link_demo) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [titolo, descrizione, tecnologie, link_repo, link_demo], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore inserimento progetto', err });
    res.status(201).json({ message: 'Progetto creato', id: result.insertId });
  });
});

// READ - pubblico
router.get('/', (req, res) => {
  db.query('SELECT * FROM progetti', (err, results) => {
    if (err) return res.status(500).json({ message: 'Errore lettura progetti', err });
    res.json(results);
  });
});

// UPDATE - solo admin
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { id } = req.params;
  const { titolo, descrizione, tecnologie, link_repo, link_demo } = req.body;
  if (!titolo || !descrizione) return res.status(400).json({ message: 'Titolo e descrizione obbligatori' });

  const query = `UPDATE progetti SET titolo = ?, descrizione = ?, tecnologie = ?, link_repo = ?, link_demo = ? WHERE id = ?`;
  db.query(query, [titolo, descrizione, tecnologie, link_repo, link_demo, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore aggiornamento progetto', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Progetto non trovato' });
    res.json({ message: 'Progetto aggiornato' });
  });
});

// DELETE - solo admin
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.ruolo !== 'admin') return res.status(403).json({ message: 'Accesso negato' });

  const { id } = req.params;
  const query = `DELETE FROM progetti WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Errore cancellazione progetto', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Progetto non trovato' });
    res.json({ message: 'Progetto cancellato' });
  });
});

module.exports = router;
