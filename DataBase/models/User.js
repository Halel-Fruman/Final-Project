const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [
    {
      productId: String,
      quantity: Number,
    },
  ],
  wishlist: [String],
});

// הגדרת המודל ושם ה-collection
const User = mongoose.model('User', userSchema, 'User');

module.exports = User;
