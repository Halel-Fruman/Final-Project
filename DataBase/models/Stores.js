const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
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
about: {
    he: { type: String, required: false },
    en: { type: String, required: false },
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
          match: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/,
        },
      },
    ],
    deliveryOptions: {
      homeDelivery: {
        company: { type: String, required: false },
        price: { type: Number, required: false, default: 0 },
      },
          },
  },
  { timestamps: true }
);

const Stores = mongoose.model('Stores', storeSchema, 'Stores');
module.exports = Stores;
