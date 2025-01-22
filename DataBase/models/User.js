const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true }, // מזהה העסקה מהסליקה
  status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'pending' }, // סטטוס העסקה
  totalAmount: { type: Number, required: true }, // סכום העסקה הכולל
  createdAt: { type: Date, default: Date.now }, // תאריך העסקה
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // מזהה מוצר
      name: { type: String, required: true }, // שם המוצר
      price: { type: Number, required: true }, // מחיר המוצר
      quantity: { type: Number, required: true, min: 1 }, // כמות שנרכשה
      storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" }, // מזהה החנות
      storeName: { type: String, required: true }, // שם החנות
      delivery: {
        deliveryMethod: { type: String, enum: ['pickup', 'courier', 'express'], required: true }, // שיטת משלוח
        deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'canceled'], default: 'pending' }, // סטטוס משלוח
        trackingNumber: { type: String, default: '' }, // מספר מעקב
        estimatedDelivery: { type: Date }, // תאריך הגעה משוער
      }
    }
  ]
});
const userSchema = new mongoose.Schema({
  first_name:{type:String, required:true},
  last_name:{type:String, required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role:{type: String, enum: ['user','storeManager','admin'], default:'user'},
  addresses: { type: [String], default: [] },
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, min: 1 },
  },],
  wishlist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  transactions: [transactionSchema] // מערך העסקאות

});

module.exports = mongoose.model('User', userSchema,'User');
