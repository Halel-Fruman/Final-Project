const mongoose = require('mongoose');

// Admin Schema
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
});

// הגדרת המודל ושם ה-collection
const Admin = mongoose.model('Admin', userSchema, 'Admin');

module.exports = Admin;
