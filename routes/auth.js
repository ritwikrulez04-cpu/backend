import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/mailer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Username or email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();

    const user = new User({
      username,
      email,
      password: hashedPassword,
      verificationCode: code,
      verificationExpires: new Date(Date.now() + 15 * 60000),
    });

    await user.save();
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: 'Registered. Check your email for the code.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    if (user.verificationCode === code && user.verificationExpires > new Date()) {
      user.isVerified = true;
      user.verificationCode = null;
      user.verificationExpires = null;
      await user.save();
      res.json({ message: 'Email verified. You can now log in.' });
    } else {
      res.status(400).json({ message: 'Invalid or expired code.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

export default router;
