const mongoose = require("mongoose");

/** * @module Stores
 * @typedef StoreSchema
 * @property {Object} name - Name of the store in Hebrew and English.
 * @property {String} name.he - The store's name in Hebrew.
 * @property {String} name.en - The store's name in English.
 * @property {String} address - The store's address.
 * @property {String} email - The store's email address.
 * @property {Object} about - Description of the store in Hebrew and English.
 * @property {String} about.he - The store's description in Hebrew.
 * @property {String} about.en - The store's description in English.
 * @property {Array} manager - List of managers for the store, each with a name and email address.
 * @property {String} manager.name - The name of the manager.
 * @property {String} manager.emailAddress - The email address of the manager.
 * @property {Object} deliveryOptions - Delivery options available for the store.
 * @property {Object} deliveryOptions.homeDelivery - Home delivery options.
 * @property {String} deliveryOptions.homeDelivery.company - The delivery company for home delivery.
 * @property {Number} deliveryOptions.homeDelivery.price - The price for home delivery.
 * @description Mongoose schema for a store in the Stores collection.
 * @requires mongoose
 */
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

const Stores = mongoose.model("Stores", storeSchema, "Stores");
module.exports = Stores;
