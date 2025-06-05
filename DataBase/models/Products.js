const mongoose = require("mongoose");

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
 // רשימת קטגוריות בכל שפה
    attributes: {
      en: { type: Map, of: String },
      he: { type: Map, of: String },
    }, // מאפייני מוצר (צבע, גודל וכו')
    highlight: {
      en: [String],
      he: [String],
    }, // תיאור מקוצר של המוצר - מאפיינים
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }, // כמות במלאי
    allowBackorder: { type: Boolean, default: false }, // האם ניתן להזמין כשהמלאי נגמר
    discounts: [
      {
        percentage: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ], // מבצעים
    internationalShipping: { type: Boolean, default: false }, // האם ניתן לשלוח לחו"ל
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
    ], // חוות דעת גולשים
    manufacturingCost: { type: Number, default: 0 }, // עלות ייצור
    images: [{ type: String }], // רשימת כתובות תמונות
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// חישוב רווח דינמי
productSchema.virtual("profitMargin").get(function () {
  return this.price - this.manufacturingCost;
});

const storeProductsSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    unique: true,
  }, // מזהה החנות
  storeName: {
    he: { type: String, required: true },
    en: { type: String, required: true },
  }, // שם החנות
  

products: {
    type: [productSchema]
  }});

const Products = mongoose.model(
  "StoreProducts",
  storeProductsSchema,
  "Products"
);
module.exports = Products;
