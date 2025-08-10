const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Token mancante' });

    const token = authHeader.split(' ')[1]; // 
    if (!token) return res.status(401).json({ message: 'Token non valido' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token non valido o scaduto' });
        req.user = user; // user contiene i dati che abbiamo messo nel sign()
        next();
    });
}

module.exports = authMiddleware;
