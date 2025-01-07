require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRoutes = require('./Routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema & Model
const User = require('./models/User');
app.use('/User', userRoutes); // All routes of userRoutes will start with /User

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Error registering user: ' + err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  console.log('Request body:', req.body); // Ensure that email and password data is received

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    res.status(400).json({ error: 'Error logging in: ' + err.message });
  }
});

// Get User
app.get('/User/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user: ' + error.message });
  }
});

// Add Address
app.post('/User/:userId/add-address', async (req, res) => {
  const { userId } = req.params;
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.addresses = user.addresses || []; // Ensure the key exists
    user.addresses.push(address); // Add the address to the list of addresses
    await user.save();

    res.status(200).json({ message: 'Address added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
