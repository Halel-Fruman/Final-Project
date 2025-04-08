require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./Routes/userRoutes');
const storeRoutes = require('./Routes/storeRoutes'); // ייבוא הנתיבים של החנויות
const realProductRoutes = require('./Routes/realProductsRoutes'); // מוצרים אמיתיים
const transactionRoutes = require('./Routes/transactionRoutes'); // עסקאות
const categoryRoutes = require("./Routes/categoryRoutes");
const emailRoutes = require("./Routes/emailRoutes"); // דוא"ל



const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log(`✅ Connected to MongoDB`))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/User', userRoutes);
app.use('/api/Stores', storeRoutes);
app.use('/api/Products', realProductRoutes);
app.use('/api/Transactions', transactionRoutes);
app.use('/api/Category', categoryRoutes);
app.use('/api/email', emailRoutes);









// Start Server
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
