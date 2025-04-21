const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    he: { type: String, required: true, unique: true },
    en: { type: String, required: true, unique: true },
  },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    manager: [
      {
        name: {
          type: String,
          required: true,
        },
        emailAddress: {
          type: String,
          required: true,
          match: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/, // אימות כתובת מייל
        },
      },
    ],
  }, { timestamps: true });  // שדות תאריך עדכון

  const Stores = mongoose.model('Stores', storeSchema, 'Stores');
  module.exports = Stores;

