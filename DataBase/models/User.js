const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "storeManager", "admin"],
    default: "user",
  },
  addresses: {
    type: [{ city: { type: String }, streetAddress: { type: String }}],
    default: [],
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      quantity: { type: Number, min: 1 },
    },
  ],
  wishlist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  transactions: { type: [String], default: [] }, // מערך העסקאות
});

module.exports = mongoose.model("User", userSchema, "User");
