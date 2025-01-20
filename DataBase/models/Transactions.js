const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // מזהה משתמש
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Stores', required: true }, // מזהה חנות
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true }, // מזהה מוצר
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // מחיר פריט בזמן הרכישה
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'pending' }, // סטטוס העסקה
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'cash'], required: true }, // שיטת תשלום
    createdAt: { type: Date, default: Date.now },
});

const Transactions = mongoose.model('Transactions', transactionSchema, 'Transactions');
module.exports = Transactions;
