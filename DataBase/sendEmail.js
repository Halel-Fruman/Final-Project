const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // TLS
debug:true,
logger:true,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});
async function sendEmail( {to, subject, html}) {
   try {
    const info = await transporter.sendMail({
      from: `Ilan Mall <${process.env.OUTLOOK_EMAIL}>`,

      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error;
  }
}

module.exports =  sendEmail ;