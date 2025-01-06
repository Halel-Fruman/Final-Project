const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const SECRET_KEY = 'your-secret-key'; // החלף במפתח סודי אמיתי

// התחברות משתמש
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // חיפוש המשתמש ב-collection
    console.log('coll:', await User.find());
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    // בדיקה שהסיסמה תואמת
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    // יצירת Token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});

module.exports = router;
