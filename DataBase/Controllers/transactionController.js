const StoreTransactions = require("../models/Transactions");
// const StoreTransactions = require("../models/StoreTransactions");

// Get all transactions for a specific store
const getStoreTransaction = async (req, res) => {
  // Check if storeId is provided
  try {
    const store = await StoreTransactions.findOne({
      storeId: req.params.storeId,
    });
    if (!store) return res.status(404).json({ message: "חנות לא נמצאה" });

    // If store exists, return its transactions
    res.json(store.transactions);
  } catch (error) {
    // If an error occurs, return a 500 status with the error message
    res.status(500).json({ message: error.message });
  }
};

// Update a specific transaction by transactionId
// This function updates a transaction within a store's transactions array
const updateTransaction = async (req, res) => {
  // Check if transactionId is provided in the request parameters
  try {
    const { transactionId } = req.params;
    const updatedData = req.body;
    const updatedTransaction = await StoreTransactions.findOneAndUpdate(
      { "transactions.transactionId": transactionId },
      { $set: { "transactions.$": updatedData } },
      { new: true }
    );
    // If no transaction is found, return a 404 status
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    // If the transaction is successfully updated, return the updated transaction
    res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all transactions from the StoreTransactions collection
const getTransactions = async (req, res) => {
  try {
    const transactions = await StoreTransactions.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת העסקאות", error });
  }
};

// Get a specific transaction by its ID
const getTransactionsByID = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Check if transactionId is provided
    const storeTransaction = await StoreTransactions.findOne({
      "transactions.transactionId": transactionId,
    });

    if (!storeTransaction) {
      return res.status(404).json({ message: "העסקה לא נמצאה" });
    }
    // Find the specific transaction within the store's transactions
    const transaction = storeTransaction.transactions.find(
      (t) => t.transactionId === transactionId
    );

    if (!transaction) {
      return res.status(404).json({ message: "העסקה לא נמצאה בתוך המסמך" });
    }

    // Return the transaction details along with the store name
    res.status(200).json({
      ...(transaction.toObject?.() || transaction),
      storeName: storeTransaction.storeName,
    });
  } catch (error) {
    console.error("שגיאה ב-getTransactionsByID:", error);
    res.status(500).json({ message: "שגיאה בקבלת העסקאות", error });
  }
};

// Get orders by transactionId
// This function retrieves all orders associated with a specific transactionId across all stores
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

    // Flatten the transactions from all stores that match the transactionId
    // and include storeId and storeName in the result
    // This will return an array of orders with their respective store details
    // Use flatMap to iterate over each store document and filter transactions
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
    console.log("storeId", storeId);
    console.log(transaction.transactionId);
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let storeDoc = await StoreTransactions.findOne({ storeId });
    let newTransaction;

    if (!storeDoc) {
      const orderCounter = 1;
      const orderId = `${storeName.en
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase()}-${orderCounter}`;
      newTransaction = { ...transaction, orderId };

      storeDoc = new StoreTransactions({
        storeId,
        storeName,
        orderCounter,
        ordersStart: storeName.en.trim().replace(/\s+/g, "").toUpperCase(),
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
