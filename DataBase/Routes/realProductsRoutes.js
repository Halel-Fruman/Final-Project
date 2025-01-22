const express = require("express");
const router = express.Router();
const Product = require("../models/Products"); // חיבור למודל המוצרים האמיתי

// קבלת כל המוצרים
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// קבלת מוצר לפי ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const { name, price, stock, description, store, categories } = req.body;

    // המרת קטגוריות באמצעות axios
    const categoriesO = await Promise.all(
      categories.map(async (categoryId) => {
        try {
          const response = await axios.get(`http://localhost:5000/Category/${categoryId}`);
          const category = response.data;

          if (!category.name || !category.name.en || !category.name.he) {
            throw new Error(`Invalid category format for category ${categoryId}`);
          }

          // השתמש בקטגוריה כפי שהיא
          return category.name;
        } catch (err) {
          console.error(`Error fetching category ${categoryId}:`, err.message);
          throw new Error(`Failed to fetch category ${categoryId}`);
        }
      })
    );

    const newProduct = new Product({
      name,
      price: parseFloat(price), // המרת מחיר למספר
      stock: parseInt(stock, 10), // המרת מלאי למספר
      description,
      store: store, // המרת מזהה חנות ל-ObjectId
      categories: categoriesO, // רשימת קטגוריות בפורמט הנדרש
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(400).json({ message: err.message });
  }
});


// עדכון מוצר
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// מחיקת מוצר
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
