// src/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.error('Errore di connessione al DB:', err);
        process.exit(1);
    }
    console.log('✅ Connessione al DB riuscita');
});

module.exports = connection;
