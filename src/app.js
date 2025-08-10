// src/app.js
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const authRoutes = require('./routes/auth');

const progettiRoutes = require('./routes/progetti');
const certificazioniRoutes = require('./routes/certificazioni');
const esperienzeRoutes = require('./routes/esperienze');

app.use('/api/progetti', progettiRoutes);
app.use('/api/certificazioni', certificazioniRoutes);
app.use('/api/esperienze', esperienzeRoutes);


// Middleware per leggere JSON
app.use(express.json());

// Rotte
app.use('/api/auth', authRoutes);

// Avvio server
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server avviato sulla porta ${process.env.PORT}`);
});
