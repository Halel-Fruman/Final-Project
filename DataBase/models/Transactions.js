const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true }, // מזהה ייחודי לעסקה (מהסליקה)
  orderId: { type: String, required: true }, // מזהה ייחודי להזמנה (לפי חנות)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // מזהה המשתמש שביצע את העסקה
  status: { type: String, enum: ['pending', 'shipped','completed', 'canceled'], default: 'pending' }, // סטטוס העסקה
  totalAmount: { type: Number, required: true }, // סכום העסקה הכולל לחנות זו
  createdAt: { type: Date, default: Date.now }, // תאריך העסקה
  buyerDetails: { // פרטי הקונה
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // מזהה מוצר
      name: { type: String, required: true }, // שם המוצר
      price: { type: Number, required: true }, // מחיר המוצר
      quantity: { type: Number, required: true, min: 1 }, // כמות שנרכשה
    }
  ],
  delivery: { // פרטי משלוח
    deliveryMethod: { type: String, enum: ['pickup', 'courier', 'express'], required: true }, // שיטת משלוח
    deliveryStatus: { type: String, enum: ['pending', 'packed', 'shipped', 'completed', 'canceled'], default: 'pending' },
    trackingNumber: { type: String, default: '' }, // מספר מעקב אם רלוונטי
    estimatedDelivery: { type: Date }, // תאריך הגעה משוער
  }
});

const storeTransactionsSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, unique: true }, // מזהה החנות
  storeName: { type: String, required: true }, // שם החנות
  orderCounter: { type: Number, default: 0 },
  transactions: [transactionSchema] // מערך עסקאות של החנות
});

module.exports = mongoose.model('StoreTransactions', storeTransactionsSchema, 'Transactions');
