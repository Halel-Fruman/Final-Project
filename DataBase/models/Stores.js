const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
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
          match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/, // אימות כתובת מייל
        },
      },
    ],
  }, { timestamps: true });  // שדות תאריך עדכון
  
  const Stores = mongoose.model('Stores', storeSchema, 'Stores');
  module.exports = Stores;

  