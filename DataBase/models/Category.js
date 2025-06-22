// models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, unique: true },
      he: { type: String, required: true, unique: true },
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

module.exports = mongoose.model('Category', categorySchema);
