const mongoose = require("mongoose");

/** * @module Products
 * @typedef {Object} ProductSchema
 * @property {Object} name - Name of the product in Hebrew and English.
 * @property {Object} description - Description of the product in Hebrew and English.
 * @property {Array} categories - List of categories the product belongs to, each being an
 * ObjectId reference to a Category model.
 * @property {Object} attributes - Product attributes (color, size, etc.) in Hebrew and English.
 * @property {Object} highlight - Short description of the product's features in Hebrew and English.
 * @property {Number} price - Price of the product.
 * @property {Number} stock - Quantity of the product in stock.
 * @property {Boolean} allowBackorder - Whether backorders are allowed when stock is zero.
 * @property {Array} discounts - List of discounts applicable to the product, each with a percentage, start date, and end date.
 * @property {Boolean} internationalShipping - Whether the product can be shipped internationally.
 * @property {Array} reviews - List of user reviews for the product, each containing a user reference, rating, comment in Hebrew and English, and creation date.
 * @property {Number} manufacturingCost - Cost of manufacturing the product.
 * @property {Array} images - List of image URLs for the product.
 * @property {Date} createdAt - Timestamp of when the product was created.
 * @description Mongoose schema for product data in the application.
 * @requires mongoose
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      he: { type: String, required: true },
    },
    description: {
      en: { type: String },
      he: { type: String },
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    attributes: {
      en: { type: Map, of: String },
      he: { type: Map, of: String },
    },
    highlight: {
      en: [String],
      he: [String],
    },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    allowBackorder: { type: Boolean, default: false },
    discounts: [
      {
        percentage: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    internationalShipping: { type: Boolean, default: false },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: {
          en: { type: String },
          he: { type: String },
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    manufacturingCost: { type: Number, default: 0 },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productSchema.virtual("profitMargin").get(function () {
  return this.price - this.manufacturingCost;
});

/** * @typedef {Object} StoreProductsSchema
 * @property {mongoose.Schema.Types.ObjectId} storeId - Reference to the store this product list belongs to.
 * @property {Object} storeName - Name of the store in Hebrew and English.
 * @property {Array} products - List of products in the store, each following the ProductSchema.
 * @description Mongoose schema for a store's product list.
 * @requires mongoose
 */
const storeProductsSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    unique: true,
  },
  storeName: {
    he: { type: String, required: true },
    en: { type: String, required: true },
  },

  products: {
    type: [productSchema],
  },
});

const Products = mongoose.model(
  "StoreProducts",
  storeProductsSchema,
  "Products"
);
module.exports = Products;
