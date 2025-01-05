const express = require('express');
const connectDB = require('./db'); // קובץ החיבור

const app = express();

// התחבר למסד הנתונים
connectDB();

app.use(express.json()); // לעבודה עם JSON

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server running on port ${PORT}'));