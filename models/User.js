// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true          // ← enforce unique usernames
  },
  email: {
    type: String,
    required: true,
    unique: true          // ← enforce one account per email
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false       // ← only true after email verification
  },
  verificationCode: String,  // ← store the 6‑digit code
  verificationExpires: Date  // ← code expiry timestamp
});

// Create the unique indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
