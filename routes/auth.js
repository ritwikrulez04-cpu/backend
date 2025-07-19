// routes/auth.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');


// POST /api/auth/register
// Body: { username, email, password }
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Prevent duplicate email or username
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Generate a 6‑digit code and expiry 15m out
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Create unverified user
    const user = new User({
      username,
      email,
      password,                // TODO: hash before saving!
      isVerified: false,
      verificationCode: code,
      verificationExpires: expires
    });
    await user.save();

    // Send the code via email
    await sendVerificationEmail(email, code);

    return res.status(201).json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Register error:', err);
    return res.sendStatus(500);
  }
});


// POST /api/auth/verify
// Body: { email, code }
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      return res.status(400).json({ message: 'Invalid code or email' });
    }
    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ message: 'Code expired' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return res.json({ message: 'Account verified' });
  } catch (err) {
    console.error('Verify error:', err);
    return res.sendStatus(500);
  }
});


// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified' });
    }

    // Issue JWT or session here; for simplicity we return user data
    // e.g. const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return res.json({ username: user.username, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    return res.sendStatus(500);
  }
});


// (Optional) POST /api/auth/logout
// Body: none
router.post('/logout', (req, res) => {
  // If using sessions: req.session.destroy()
  // If using JWT: instruct client to delete token
  return res.json({ message: 'Logged out' });
});


module.exports = router;
