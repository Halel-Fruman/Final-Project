const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../sendEmail");
const bcrypt = require("bcrypt");
const BASE_URL = process.env.REACT_APP_BASE_URL || "https://yourdomain.com";

// forgot Password function, creates a reset token and sends an email with the reset link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a reset token by hashing a random string
    // and store it in the user's document
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // Token valid for 1 hour
    await user.save();

    // Create a reset link using the token
    // and the base URL of your application
    const resetLink = `${BASE_URL}/reset-password/${token}`;
    await sendEmail(
      email,
      "Password Reset Request",
      `Click the link to reset your password: ${resetLink}`
    );

    res.json({ message: "Reset link sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// reset Password function, verifies the token and updates the user's password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Validate the token and update the password
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Check if user exists and token is valid
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    //encrypt the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update the user's password and clear the reset token and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
