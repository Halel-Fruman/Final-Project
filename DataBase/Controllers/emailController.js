

const { sendEmail } = require("../sendEmail");

const sendConfirmationEmail = async (req, res) => {
  const { userEmail, userName } = req.body;

  try {
    await sendEmail({
      to: userEmail,
      subject: "אישור הזמנה",
      html: `<h1>שלום ${userName},</h1><p>הזמנתך התקבלה בהצלחה!</p>`,
    });

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

module.exports = { sendConfirmationEmail };
