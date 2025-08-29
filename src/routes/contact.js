// routes/contact.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/', async (req, res) => {
  console.log('--- RICHIESTA CONTACT ---');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('-------------------------');

  const { nome, email, messaggio } = req.body;

  if (!nome || !email || !messaggio) {
    return res.status(400).json({ msg: "Compila tutti i campi" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,               // Cambiato da 465 a 587
      secure: false,           // Cambiato da true a false
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });


    console.log('Tentativo invio email tramite SMTP...');

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nuovo messaggio da ${nome}`,
      text: `${messaggio}\n\nDa: ${email}`,
      replyTo: email,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Risultato invio:', info);

    return res.json({ msg: "Messaggio inviato con successo!" });
  } catch (err) {
    console.error('❌ ERRORE INVIO EMAIL:', err);
    return res.status(500).json({
      msg: "Errore nell'invio dell'email",
      error: err.message
    });
  }
});

module.exports = router;
