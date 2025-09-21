const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  // Configure your transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: 'therath2426@gmail.com',
      pass: 'wexw atyw sqej vzzu'
    }
  });

  const mailOptions = {
    from: email,
    to: 'therath2426@gmail.com', // your business email
    subject: 'New Contact Us Message',
    text: `
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;