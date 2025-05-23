require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./Routes/userRoutes');
const storeRoutes = require('./Routes/storeRoutes'); 
const realProductRoutes = require('./Routes/realProductsRoutes');
const transactionRoutes = require('./Routes/transactionRoutes'); 
const categoryRoutes = require("./Routes/categoryRoutes");
const emailRoutes = require("./Routes/emailRoutes"); 



const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
const path = require("path");
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`✅ Connected to MongoDB`))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

/// Routes
app.use('/api/User', userRoutes);
app.use('/api/Stores', storeRoutes);
app.use('/api/Products', realProductRoutes);
app.use('/api/Transactions', transactionRoutes); 
app.use("/api/Category", categoryRoutes);
app.use("/api/email", emailRoutes);

// User Schema & Model
const User = require('./models/User');
const e = require('express');
// Store Routes






// Start Server
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
