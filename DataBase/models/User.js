const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  addresses: { type: [String], default: [] },
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, min: 1 },
  },],
  wishlist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      addedAt: { type: Date, default: Date.now },
    },
  ]
});

module.exports = mongoose.model('User', userSchema,'User');
