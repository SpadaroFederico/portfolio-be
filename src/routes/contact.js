// routes/contact.js
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Imposta la chiave API SendGrid
sgMail.setApiKey(process.env.CONTACT_API);

router.post('/', async (req, res) => {
  const { nome, email, messaggio } = req.body;

  if (!nome || !email || !messaggio) {
    return res.status(400).json({ msg: "Compila tutti i campi" });
  }

  try {
    const msg = {
      to: process.env.CONTACT_EMAIL, // destinatario
      from: 'federicospadaro2@gmail.com', // mittente verificato su SendGrid
      subject: `Nuovo messaggio da ${nome}`,
      text: `${messaggio}\n\nDa: ${email}`,
      replyTo: email,
    };

    await sgMail.send(msg);
    res.json({ msg: "Messaggio inviato con successo!" });
  } catch (err) {
    res.status(500).json({ msg: "Errore nell'invio dell'email", error: err.message });
  }
});

module.exports = router;
