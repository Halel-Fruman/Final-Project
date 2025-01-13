const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    he: { type: String, required: true },
  },
  highlight: {
    en: [String],
    he: [String],
  },
  details: {
    en: { type: String },
    he: { type: String },
  },
  picture: { type: String, required: true },
  review: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Example_products', productSchema,'Example_products');
