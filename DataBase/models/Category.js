// models/Category.js

const mongoose = require("mongoose");

/**
 * @module Category
 * @typedef {Object} CategorySchema
 * @property {Object} name - Name of the category in Hebrew and English.
 * @description Mongoose schema for a category in the Categories collection.
 * @requires mongoose
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, unique: true },
      he: { type: String, required: true, unique: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
