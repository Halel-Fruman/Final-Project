const StoreTransactions = require("../models/Transactions");
// const StoreTransactions = require("../models/StoreTransactions");

const getStoreTransaction = async (req, res) => {
  try {
    const store = await StoreTransactions.findOne({
      storeId: req.params.storeId,
    });
    if (!store) return res.status(404).json({ message: "חנות לא נמצאה" });

    res.json(store.transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// editing transactions
const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const updatedData = req.body;
    console.log(transactionId);
    const updatedTransaction = await StoreTransactions.findOneAndUpdate(
  { "transactions.transactionId": transactionId },
  { $set: { "transactions.$": updatedData } },
  { new: true }
);

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await StoreTransactions.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת העסקאות", error });
  }
};

// Get all transactions

const getTransactionsByID = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // חיפוש במסמך שיש בו את העסקה עם transactionId תואם
    const storeTransaction = await StoreTransactions.findOne({
      "transactions.transactionId": transactionId,
    });

    if (!storeTransaction) {
      return res.status(404).json({ message: "העסקה לא נמצאה" });
    }

    // שליפת העסקה הספציפית מתוך המערך
    const transaction = storeTransaction.transactions.find(
      (t) => t.transactionId === transactionId
    );

    if (!transaction) {
      return res.status(404).json({ message: "העסקה לא נמצאה בתוך המסמך" });
    }

    // הוספת שם החנות למידע (כדי שיהיה זמין ב-frontend)
    res.status(200).json({
      ...(transaction.toObject?.() || transaction),
      storeName: storeTransaction.storeName,
    });
  } catch (error) {
    console.error("שגיאה ב-getTransactionsByID:", error);
    res.status(500).json({ message: "שגיאה בקבלת העסקאות", error });
  }
};
const getOrdersByTransactionId = async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({ message: "Missing transactionId" });
  }

  try {
    const storeDocs = await StoreTransactions.find({
      "transactions.transactionId": transactionId,
    });

    if (!storeDocs || storeDocs.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this transactionId" });
    }

    const matchingOrders = storeDocs.flatMap((storeDoc) =>
      storeDoc.transactions
        .filter((tx) => tx.transactionId === transactionId)
        .map((tx) => ({
          ...tx.toObject(),
          storeId: storeDoc.storeId,
          storeName: storeDoc.storeName,
        }))
    );

    res.status(200).json(matchingOrders);
  } catch (error) {
    console.error(
      "Error fetching transactions by transactionId:",
      error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getOrdersByTransactionId,
};

// Update product status
const updateProductStatus = async (req, res) => {
  const { transactionId } = req.params;
  const { productId, status } = req.body;

  try {
    const transaction = await transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "עסקה לא נמצאה" });
    }

    const product = transaction.products.find(
      (p) => p.productId.toString() === productId
    );
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

const updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    const updated = await StoreTransactions.findOneAndUpdate(
      { "transactions.transactionId": transactionId },
      { $set: { "transactions.$.status": status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "עסקה לא נמצאה" });
    }

    res.status(200).json({ message: "סטטוס עודכן בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "שגיאה בעדכון הסטטוס", error });
  }
};

const addTransaction = async (req, res) => {
  const { storeId, storeName, transaction } = req.body;

  if (!storeId || !storeName || !transaction || !transaction.transactionId) {
	console.log("storeId",storeId );
	console.log (transaction.transactionId);
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let storeDoc = await StoreTransactions.findOne({ storeId });
    let newTransaction;
	
    if (!storeDoc) {
      const orderCounter = 1;
      const orderId = `${storeName.en
        .trim().replace(/\s+/g, '')
        .toUpperCase()}-${orderCounter}`;
      newTransaction = { ...transaction, orderId };

      storeDoc = new StoreTransactions({
        storeId,
        storeName,
        orderCounter,
        ordersStart: storeName.en.trim().replace(/\s+/g, '').toUpperCase(),
        transactions: [newTransaction],
      });
    } else {
      storeDoc.orderCounter = storeDoc.orderCounter + 1;
      const orderId = `${storeDoc.ordersStart}-${storeDoc.orderCounter}`;
      newTransaction = { ...transaction, orderId };

      storeDoc.transactions.push(newTransaction);
    }

    await storeDoc.save();

    res.status(201).json({
      message: "Transaction added successfully",
      newTransaction,
    });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res
      .status(500)
      .json({ message: "Error adding transaction", error: error.message });
  }
};

// Export the functions
module.exports = {
  getTransactions,
  updateTransaction,
  updateProductStatus,
  getStoreTransaction,
  getTransactionsByID,
  addTransaction,
  updateTransactionStatus,
  getOrdersByTransactionId,
};
