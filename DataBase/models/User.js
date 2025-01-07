const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  addresses: { type: [String], default: [] },
  cart: { type: Array, default: [] },
  wishlist: { type: Array, default: [] }
});

module.exports = mongoose.model('User', userSchema,'User');
