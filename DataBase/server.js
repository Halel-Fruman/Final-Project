require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./Routes/userRoutes');
const productRoutes = require('./Routes/productsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/User', userRoutes); // כל הנתיבים של userRoutes יתחילו ב- /User
app.use('/Example_products', productRoutes);
// User Schema & Model
const User = require('./models/User');
// Store Routes
const storeRoutes = require('./Routes/storeRoutes'); // ייבוא הנתיבים של החנויות

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
  console.log('Request body:', req.body); // תוודא שהנתונים של email ו-password מגיעים

  const { email, password } = req.body;
  try {
    const user = await User.findOne({email });
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


// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
