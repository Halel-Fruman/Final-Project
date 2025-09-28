const mongoose = require("mongoose");

/**
 * @module StoreTransactions
 * @typedef {Object} TransactionSchema
 * @property {String} transactionId - Unique identifier for the transaction (from payment gateway).
 * @property {String} orderId - Unique identifier for the order
 * @property {mongoose.Schema.Types.ObjectId} userId - Reference to the user who made the transaction.
 * @property {String} status - Status of the transaction (pending, packed, shipped, completed, canceled).
 * @property {Number} totalAmount - Total amount of the transaction for the store.
 * @property {Date} createdAt - Date of the transaction.
 * @property {Object} buyerDetails - Details of the buyer including full name, phone, email, and address.
 * @property {Array} products - List of products in the transaction, each with productId, name, price, and quantity.
 * @property {Object} delivery - Delivery details including method, status, tracking number, and estimated delivery date.
 * @property {String} delivery.deliveryMethod - Method of delivery (pickupFromStore, courier, pickupPoint).
 * @property {String} delivery.deliveryStatus - Status of the delivery (pending, packed, shipped, completed, canceled).
 * @property {String} delivery.trackingNumber - Tracking number for the delivery.
 * @property {Date} delivery.estimatedDelivery - Estimated delivery date.
 * @description Mongoose schema for a single transaction in a store's transactions collection.
 * @requires mongoose
 */
const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  orderId: { type: String, required: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "packed", "shipped", "completed", "canceled"],
    default: "pending",
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  buyerDetails: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  delivery: {
    deliveryMethod: {
      type: String,
      enum: ["pickupFromStore", "courier", "pickupPoint"],
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "packed", "shipped", "completed", "canceled"],
      default: "pending",
    },
    trackingNumber: { type: String, default: "" },
    estimatedDelivery: { type: Date },
  },
});

/**
 * @module StoreTransactions
 * @typedef {Object} StoreTransactionsSchema
 * @property {mongoose.Schema.Types.ObjectId} storeId - Reference to the store.
 * @property {Object} storeName - Name of the store.
 * @property {String} ordersStart - Code for store to make orders ID unique for each store.
 * @property {Number} orderCounter - Counter for orders of the store.
 * @property {Array<TransactionSchema>} transactions - Array of transactions for the store.
 * @description Mongoose schema for a store's transactions collection.
 * @requires mongoose
 */
const storeTransactionsSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    unique: true,
  },
  storeName: { type: Object, required: true },
  ordersStart: { type: String, default: "NS" },
  orderCounter: { type: Number, default: 0 },
  transactions: [transactionSchema],
});

module.exports = mongoose.model(
  "StoreTransactions",
  storeTransactionsSchema,
  "Transactions"
);
