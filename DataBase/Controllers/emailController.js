

const sendEmail = require("../sendEmail");

// This function sends a confirmation email to the store when a new order is placed
// It includes details about the order and the customer
// The email is sent in Hebrew and includes a link to the store management page
// It uses a delivery method map to translate delivery methods into Hebrew
// The function handles errors and returns appropriate responses
// It expects the request body to contain storeEmail, storeName, transaction, and userName
const sendConfirmationEmail = async (req, res) => {
  const { storeEmail, storeName, transaction, userName } = req.body;
  const deliveryMethodMap = {
  				"pickupFromStore": "איסוף מהחנות",
  				"homeDelivery": "משלוח עד הבית",
  				"pickupPoint": "איסוף מנקודת חלוקה"
								};


  try {
    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl;">
        <h2 style="color: #333;">התקבלה הזמנה חדשה</h2>
        <p>שלום ${storeName.he},</br>
        לקוח בשם <strong>${userName}</strong> ביצע הזמנה חדשה באתר.</p>
        <h3 style="margin-top: 10px;margin-bottom: 0px">פרטי ההזמנה:</h3>
        <strong>מספר הזמנה:  ${transaction.orderId}</strong><br/>
        <strong>מספר עסקה:  ${transaction.transactionId}</strong>

        <ul style="list-style: none; padding: 0;">
          ${transaction.products
            .map(
              (product) =>
                `<li style="margin-bottom: 4px;">
                  • ${product.name} – כמות: ${product.quantity}, מחיר: ${product.price} ₪
                </li>`
            )
            .join("")}
        </ul>
        <p><strong>סה"כ לתשלום:</strong> ${transaction.totalAmount} ₪</br>
           <strong>אמצעי משלוח:</strong> ${deliveryMethodMap[transaction.delivery.deliveryMethod] || transaction.delivery.deliveryMethod}
        <p>אנא הכינו את ההזמנה בהתאם.</p>
    <div style="text-align: right; margin-top: 10px;">
  <a href="https://ilan-israel.co.il/shop/store-management" target="_blank" style="background-color: #006a69; color: white; padding: 12px 24px; text-decoration: none; border-radius: 90px; font-weight: bold;">
    למעבר לאתר
  </a>
</div>
        <hr style="margin-top: 20px;" />
        <p style="font-size: 12px; color: #777;">הודעה זו נשלחה אוטומטית ממערכת ההזמנות.</p>
      </div>
    `;

    await sendEmail({
      to: storeEmail,
      subject: "התקבלה הזמנה חדשה באתר",
      html,
    });

    res.status(200).json({ message: "Email sent to store" });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

module.exports = { sendConfirmationEmail };
