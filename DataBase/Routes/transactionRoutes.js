const express = require("express");
const {
  getTransactions,
  updateProductStatus,
  getStoreTransaction,
  getTransactionsByID,
  addTransaction,
  updateTransactionStatus,
  getOrdersByTransactionId,
} = require("../Controllers/transactionController");

const router = express.Router();

router.post("/add", addTransaction);
router.put("/:transactionId/updateTransactionStatus", updateTransactionStatus);

// קבלת כל העסקאות של חנות מסוימת
router.get("/transactions/:storeId", getStoreTransaction);

// קבלת כל העסקאות
router.get("/", getTransactions);

router.get("/by-id/:transactionId", getTransactionsByID);
router.get("/by-transactionId/:transactionId", getOrdersByTransactionId);

// עדכון סטטוס של מוצר בתוך עסקה
router.put("/:transactionId/updateProductStatus", updateProductStatus);

// עדכון סטטוס משלוח
router.put("/:transactionId/updateDeliveryStatus", async (req, res) => {
  try {
    const { deliveryStatus, trackingNumber, estimatedDelivery } = req.body;

    const store = await StoreTransactions.findOneAndUpdate(
      { "transactions.transactionId": req.params.transactionId },
      {
        $set: {
          "transactions.$.delivery.deliveryStatus": deliveryStatus,
          "transactions.$.delivery.trackingNumber": trackingNumber,
          "transactions.$.delivery.estimatedDelivery": estimatedDelivery,
        },
      },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: "עסקה לא נמצאה" });
    }

    res.json({ message: "סטטוס משלוח עודכן בהצלחה", store });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
