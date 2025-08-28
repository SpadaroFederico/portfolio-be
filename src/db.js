const mysql = require('mysql2');

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect(err => {
    if (err) {
        console.error('❌ Errore di connessione al DB:', err);
        process.exit(1);
    }
    console.log('✅ Connessione al DB riuscita');

    // TEST: mostra tutte le tabelle presenti
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('❌ Errore nel recuperare le tabelle:', err);
        } else {
            console.log('📋 Tabelle presenti nel DB:');
            console.table(results);
        }
    });
});

module.exports = connection;
