const express = require("express");
const router = express.Router();
const StoreProducts = require("../models/Products");
const mongoose = require("mongoose");
const axios = require("axios");

// קבלת כל המוצרים מכל החנויות
router.get("/", async (req, res) => {
  try {
    const stores = await StoreProducts.find();
    const allProducts = stores.flatMap((store) =>
      store.products.map((product) => ({
        ...product.toObject(),
        storeId: store._id,
        storeName: store.storeName,
      }))
    );
    res.json(allProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// קבלת מוצר לפי ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Find the store that contains the product
    const store = await StoreProducts.findOne({ "products._id": id });
    if (!store) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the product inside the store
    const product = store.products.find(
      (product) => String(product._id) === id
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the product with store details
    res.json({
      ...product.toObject(),
      storeId: store.storeId, // Include the store's ID
      storeName: store.storeName, // Include the store's name
    });
  } catch (err) {
    console.error("Error fetching product:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// יצירת מוצר חדש בחנות
router.post("/", async (req, res) => {
  try {
    const { name, price, stock, description, storeId, categories } = req.body;

    const store = await StoreProducts.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const newProduct = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      description,
      categories,
    };

    store.products.push(newProduct);
    await store.save();

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// עדכון מוצר
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const store = await StoreProducts.findOne({ "products._id": id });
    if (!store) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productIndex = store.products.findIndex(
      (product) => String(product._id) === id
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = {
      ...store.products[productIndex].toObject(),
      ...req.body,
    };

    store.products[productIndex] = updatedProduct;

    await store.save();

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// מחיקת מוצר
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const store = await StoreProducts.findOne({ "products._id": id });
    if (!store) {
      return res.status(404).json({ message: "Product not found" });
    }

    store.products = store.products.filter(
      (product) => String(product._id) !== id
    );

    await store.save();

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
