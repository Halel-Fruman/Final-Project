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

    await sendEmail({
  to: email,
  subject: "בקשה לאיפוס סיסמה",
  html: `
     <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 600px; margin: auto;">
    <h2 style="margin-bottom: 12px; font-size: 22px; color: #333;">איפוס סיסמה</h2>
    <div style="margin: 0 0 12px 0; font-size: 15px;">קיבלנו את הבקשה שלך לאיפוס הסיסמה .
     <br/>
     כדי להגדיר סיסמה חדשה, לחץ על הקישור הבא:</div>
    <p style="margin: 0 0 18px 0;">
      <a href="${resetLink}" style="font-size: 15px; color: #1a73e8; text-decoration: none; font-weight: bold;">
        לחץ כאן לאיפוס הסיסמה
      </a>
    </p>
    <p style="margin: 0; font-size: 13px; color: #555;">
      אם לא אתה ביצעת את הבקשה – פשוט התעלם מההודעה.
    </p>
  </div>
`});

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


