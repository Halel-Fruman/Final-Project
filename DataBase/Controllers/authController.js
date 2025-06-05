const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../sendEmail"); 
const bcrypt = require("bcrypt");


const BASE_URL = process.env.REACT_APP_BASE_URL || "https://yourdomain.com"; 

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // שעה
    await user.save();

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

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // הטוקן עדיין בתוקף
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // הצפנת סיסמה חדשה
    const hashedPassword = await bcrypt.hash(password, 10);

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
