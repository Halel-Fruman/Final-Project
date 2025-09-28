const express = require("express");
const router = express.Router();
const { sendConfirmationEmail } = require("../Controllers/emailController");

router.post("/send-confirmation", sendConfirmationEmail);

module.exports = router;
