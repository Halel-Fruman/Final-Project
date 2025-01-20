// models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, unique: true }, // שם באנגלית
      he: { type: String, required: true, unique: true }, // שם בעברית
    },
  },
  { timestamps: true } // מוסיף שדות createdAt ו-updatedAt
);

module.exports = mongoose.model('Category', categorySchema);
