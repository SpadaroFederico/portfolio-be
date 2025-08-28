// src/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect(err => {
    if (err) {
        console.error('Errore di connessione al DB:', err);
        process.exit(1);
    }
    console.log('✅ Connessione al DB riuscita');
});

module.exports = connection;
