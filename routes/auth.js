// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/mailer');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check for existing email or username
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Generate a 6‑digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user (unverified)
    const user = new User({
      username,
      email,
      password,           // TODO: hash in production!
      verificationCode: code,
      verificationExpires: expires
    });
    await user.save();

    // Send email
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
