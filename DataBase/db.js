const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://danielbt8:danielbt888@cluster0.qmcxq.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected: ${conn.connection.host}');
  } catch (error) {
    console.error('Error: ${error.message}');
    process.exit(1); // סגור את התהליך אם החיבור נכשל
  }
};

module.exports = connectDB;