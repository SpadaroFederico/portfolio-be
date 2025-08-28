require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const contactRouter = require('./routes/contact');
const authRoutes = require('./routes/auth');
const progettiRoutes = require('./routes/progetti');
const certificazioniRoutes = require('./routes/certificazioni');
const esperienzeRoutes = require('./routes/esperienze');

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Security headers
app.use(helmet());

// Parse JSON & cookies
app.use(express.json());
app.use(cookieParser());

// Trust proxy se in produzione (Heroku/Nginx) per cookie secure
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS: consentire cookie cross-site
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Rate limiter solo contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: "Troppi messaggi inviati, riprova più tardi."
});
app.use('/api/contact', contactLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificati', express.static(path.join(__dirname, 'certificati')));

// Routers
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRoutes);
app.use('/api/progetti', progettiRoutes);
app.use('/api/certificazioni', certificazioniRoutes);
app.use('/api/esperienze', esperienzeRoutes);

// Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server avviato sulla porta ${PORT}`);
});
