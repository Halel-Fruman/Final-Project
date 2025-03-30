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
// const { sendConfirmationEmail } = require("./emailController");



const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

/// Routes
app.use('/User', userRoutes); // משתמשים
app.use('/Stores', storeRoutes); // חנויות
app.use('/Products', realProductRoutes); // מוצרים אמיתיים
app.use('/Transactions', transactionRoutes); //
app.use("/Category", categoryRoutes);
app.use("/email", emailRoutes); // דוא"ל

// User Schema & Model
const User = require('./models/User');
const e = require('express');
// Store Routes






// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
