const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.CONTACT_API);

router.post('/', async (req, res) => {
  console.log('--- RICHIESTA CONTACT ---', req.body);

  const { nome, email, messaggio } = req.body;
  if (!nome || !email || !messaggio) {
    return res.status(400).json({ msg: "Compila tutti i campi" });
  }

  try {
    const msg = {
      to: process.env.CONTACT_EMAIL,
      from: process.env.SMTP_USER,  // deve essere verificato su SendGrid
      subject: `Nuovo messaggio da ${nome}`,
      text: `${messaggio}\n\nDa: ${email}`,
      replyTo: email,
    };

    await sgMail.send(msg);
    res.json({ msg: "Messaggio inviato con successo!" });
  } catch (err) {
    console.error('❌ ERRORE INVIO EMAIL:', err);
    res.status(500).json({ msg: "Errore nell'invio dell'email", error: err.message });
  }
});

module.exports = router;
