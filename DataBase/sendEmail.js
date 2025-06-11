const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "4622bf974884f2", // מהDashboard של Mailtrap
    pass: "610aca788677b4", // מהDashboard של Mailtrap
  },
});

async function sendEmail( to, subject, text ) {
 console.log("Preparing to send email...");
  console.log("To:", to);
  console.log("Subject:", subject);
  try {
    const info = await transporter.sendMail({
      from: '"My Store" <noreply@mystore.com>',
      to,
      subject,
      text,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error;
  }
}

module.exports =  sendEmail ;