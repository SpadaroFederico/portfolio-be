// routes/contact.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/', async (req, res) => {
  const { nome, email, messaggio } = req.body;

  if (!nome || !email || !messaggio) {
    return res.status(400).json({ msg: "Compila tutti i campi" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    router.post('/', (req, res, next) => {
      console.log('--- RICHIESTA CONTACT ---');
      console.log('Headers:', req.headers);
      console.log('Cookies:', req.cookies);
      console.log('Body:', req.body);
      console.log('-------------------------');
      next(); // passa al middleware effettivo per inviare email
    });

    const mailOptions = {
        from: `"Portfolio Contact" <${process.env.SMTP_USER}>`, // mittente obbligatorio
        to: process.env.CONTACT_EMAIL, // destinatario
        subject: `Nuovo messaggio da ${nome}`,
        text: `${messaggio}\n\nDa: ${email}`, // includi la mail dell'utente
        replyTo: email, // questo permette di cliccare "Rispondi" e mandare direttamente all'utente
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Messaggio inviato con successo!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Errore nell'invio dell'email" });
  }
});

module.exports = router;
