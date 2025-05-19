const express = require('express');
const router = express.Router();
const tranzilaNotifications = new Map();
// =======================
// יצירת תשלום Tranzila
// =======================
router.post('/create-payment', (req, res) => {
  const { sum, userId, selectedAddress, customer, cartDetails } = req.body;

  const terminalName = process.env.TRANZILA_TERMINAL;
  const successUrl = 'https://ilan-israel.co.il/tranzila/success.html';
  const failUrl = 'https://ilan-israel.co.il/shop/checkout/fail';
  const notifyUrl = 'https://ilan-israel.co.il/api/tranzila/notify';

  const city = selectedAddress?.city || '';
  const address = selectedAddress?.streetAddress || '';

    const jsonRaw = JSON.stringify(cartDetails || []);
    const jsonEncoded = encodeURIComponent(jsonRaw).replace(/\+/g, '%20');
  //console.log("🧾 cartDetailsEncoded:", cartDetailsEncoded);

  const formHtml = `
  <html>
    <body onload="document.forms[0].submit();">
      <form action="https://direct.tranzila.com/${terminalName}/iframenew.php" method="POST">
        <input type="hidden" name="sum" value="${sum}" />
        <input type="hidden" name="currency" value="1" />
        <input type="hidden" name="contact" value="${customer?.fullName || 'Customer'}" />
        <input type="hidden" name="phone" value="${customer?.phone || ''}" />
        <input type="hidden" name="email" value="${customer?.email || ''}" />
        <input type="hidden" name="success_url_address" value="${successUrl}" />
        <input type="hidden" name="fail_url_address" value="${failUrl}" />
        <input type="hidden" name="notify_url_address" value="${notifyUrl}" />
        <input type="hidden" name="lang" value="il" />
        <input type="hidden" name="google_pay" value="1" />
        <input type="hidden" name="city" value="${city}" />
        <input type="hidden" name="address" value="${address}" />
        <input type="hidden" name="my_custom_user_id" value="${userId}" />
        <input type="hidden" name="nologo" value="1" />
        <input type="hidden" name="trTextColor" value="006A69" />
        <input type="hidden" name="u71" value="1" />
        <input type="hidden" name="json_purchase_data" value="${jsonEncoded}" />
      </form>
      <script>
        const observer = new MutationObserver(() => {

          if (document.body.innerText.includes("התשלום בוצע בהצלחה") || document.body.innerText.includes("Thank you")) {
            window.parent.postMessage({ type: "TRZILA_PAYMENT_SUCCESS", }, "*");

          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      </script>
    </body>
  </html>
  `;

  res.send(formHtml);
});

// =======================
// קבלת אישור תשלום (notify)
// =======================
router.post('/notify', async (req, res) => {
  try {
    const data = req.body;

    if (data.Response === '000') {
      const userId = data.my_custom_user_id;
      if (userId) {
        tranzilaNotifications.set(userId, data); // שמור את ההתראה לפי מזהה משתמש
        setTimeout(() => tranzilaNotifications.delete(userId), 2 * 60 * 1000); // מחיקה אוטומטית אחרי 2 דקות
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error in notify handler:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/notify/:userId', (req, res) => {
  const data = tranzilaNotifications.get(req.params.userId);
  if (!data) return res.status(404).json({ message: "No transaction info found" });
  res.json(data);
});

module.exports = router;
