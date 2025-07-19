const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit code
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
    });

    await newUser.save();

    // Send email
    await transporter.sendMail({
      from: `"ShoppyGlobe" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email',
      text: `Your verification code is: ${verificationCode}`,
    });

    res.status(201).json({ message: 'Registration successful! Check your email for the verification code.' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified.' });

    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = undefined; // clear code after verification
      await user.save();
      res.status(200).json({ message: 'Email verified. You can now log in.' });
    } else {
      res.status(400).json({ message: 'Invalid verification code.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

module.exports = router;
