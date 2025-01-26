const Transaction = require("../models/Transactions");
// const StoreTransaction = require("../models/StoreTransactions");

const getStoreTransaction = async (req, res) => {
  try {
      const store = await StoreTransactions.findOne({ storeId: req.params.storeId });
      if (!store) return res.status(404).json({ message: "חנות לא נמצאה" });

      res.json(store.transactions);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// שליפת עסקאות
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת העסקאות", error });
  }
};
// עדכון סטטוס של מוצר בתוך עסקה
const updateProductStatus = async (req, res) => {
  const { transactionId } = req.params;
  const { productId, status } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "עסקה לא נמצאה" });
    }

    // עדכון סטטוס של המוצר בתוך העסקה
    const product = transaction.products.find(p => p.productId.toString() === productId);
    if (!product) {
      return res.status(404).json({ message: "המוצר לא נמצא בעסקה" });
    }

    product.status = status;
    await transaction.save();

    res.status(200).json({ message: "הסטטוס עודכן בהצלחה", transaction });
  } catch (error) {
    res.status(500).json({ message: "שגיאה בעדכון הסטטוס", error });
  }
};

module.exports = { getTransactions, updateProductStatus,getStoreTransaction };
