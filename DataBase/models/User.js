const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name:{type:String, required:true},
  last_name:{type:String, required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role:{type: String, enum: ['user','storeManager','admin'], default:'user'},
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
