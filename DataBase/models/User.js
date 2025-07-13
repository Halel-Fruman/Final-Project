const mongoose = require("mongoose");
/**
 * @module User
 * @typedef UserSchema
 * @property {String} first_name - The user's first name.
 * @property {String} last_name - The user's last name.
 * @property {String} email - The user's email address.
 * @property {String} password - The user's password.
 * @property {String} phoneNumber - The user's phone number.
 * @property {String} role - The user's role (user, storeManager, admin).
 * @property {Array} addresses - The user's addresses, each containing city and streetAddress.
 * @property {Array} cart - The user's shopping cart, each item containing productId and quantity.
 * @property {Array} wishlist - The user's wishlist, each item containing productId and addedAt.
 * @property {Array} transactions - The user's transaction history, each item being a string (transaction ID).
 * @property {String} refreshToken - The user's refresh token for authentication.
 * @property {String} resetPasswordToken - The token for resetting the user's password.
 * @property {Date} resetPasswordExpires - The expiration date for the reset password token.
 * @property {Boolean} emailVerified - Indicates if the user's email is verified.
 * @property {String} emailVerificationToken - The token for verifying the user's email.
 * @property {Date} emailVerificationExpires - The expiration date for the email verification token.
 * @description Mongoose schema for user data in the application.
 * @requires mongoose
 */
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
    type: [{ city: { type: String }, streetAddress: { type: String } }],
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
  transactions: { type: [String], default: [] },
  refreshToken: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
});

module.exports = mongoose.model("User", userSchema, "User");
