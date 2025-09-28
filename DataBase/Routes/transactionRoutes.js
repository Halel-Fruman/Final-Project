const express = require("express");
const {
  getTransactions,
  updateTransaction,
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

router.get("/transactions/:storeId", getStoreTransaction);

router.get("/", getTransactions);

router.put('/:transactionId/updateTransaction', updateTransaction);



router.get("/by-id/:transactionId", getTransactionsByID);
router.get("/by-transactionId/:transactionId", getOrdersByTransactionId);

router.put("/:transactionId/updateProductStatus", updateProductStatus);

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
