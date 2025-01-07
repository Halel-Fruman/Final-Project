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
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});

// עריכת פרטים אישיים (כולל כתובות וסיסמה)
router.put('/:userId/edit', async (req, res) => {
  const { userId } = req.params;
  const { field, value } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    if (field.startsWith('addresses.')) {
      // טיפול במערך כתובות
      const index = parseInt(field.split('.')[1], 10);
      if (!user.addresses[index]) return res.status(400).send('Address not found');
      user.addresses[index] = value;
    } else if (field === 'password') {
      const { currentPassword, newPassword } = value;

      // אימות סיסמה נוכחית
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).send('Current password is incorrect');

      // עדכון סיסמה חדשה עם הצפנה
      user.password = await bcrypt.hash(newPassword, 10);
    } else {
      // טיפול בשדות אחרים
      user[field] = value;
    }

    await user.save();
    res.status(200).json({ message: 'Updated successfully', user });
  } catch (error) {
    res.status(500).send('Error updating user: ' + error.message);
  }
});

// הוספת כתובת חדשה
router.post('/:userId/add-address', async (req, res) => {
  const { userId } = req.params;
  const { address } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    user.addresses.push(address); // הוספת הכתובת
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Error adding address: ' + error.message);
  }
});

// מחיקת כתובת
router.delete('/:userId/delete-address', async (req, res) => {
  const { userId } = req.params;
  const { index } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    if (!user.addresses[index]) return res.status(400).send('Address not found');

    user.addresses.splice(index, 1); // הסרת הכתובת
    await user.save();

    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).send('Error deleting address: ' + error.message);
  }
});

module.exports = router;
