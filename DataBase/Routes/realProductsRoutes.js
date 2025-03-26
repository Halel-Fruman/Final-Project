const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const StoreProducts = require("../models/Products");

// ✅ שליפת כל המוצרים מכל החנויות (למנהל מערכת)
router.get("/", async (req, res) => {
  try {
    const stores = await StoreProducts.find();
    const allProducts = stores.flatMap((store) =>
      store.products.map((product) => ({
        ...product.toObject(),
        storeId: store.storeId,
        storeName: store.storeName,
      }))
    );
    res.json(allProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ שליפת מוצרים לפי חנות (עבור מנהל חנות)
router.get("/by-store", async (req, res) => {
  const storeId = req.query.store;

  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({ message: "Invalid or missing storeId" });
  }

  try {
    const store = await StoreProducts.findOne({ storeId: new mongoose.Types.ObjectId(storeId) });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const products = store.products.map((product) => ({
      ...product.toObject(),
      storeId: store.storeId,
      storeName: store.storeName,
    }));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ הוספת מוצר לחנות עם המרת מזהי קטגוריות ל־ObjectId
// ✅ הוספת מוצר לחנות
router.post("/:storeId", async (req, res) => {
  const { storeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({ message: "Invalid store ID" });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(storeId);

    const store = await StoreProducts.findOne({ storeId: objectId });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const productData = req.body;

    // ✅ המרה של הקטגוריות ל-ObjectId
    if (Array.isArray(productData.categories)) {
      productData.categories = productData.categories.map((id) =>
        new mongoose.Types.ObjectId(id)
      );
    }

    store.products.push(productData);
    await store.save();

    res.status(201).json(productData);
  } catch (err) {
    console.error("❌ שגיאה בהוספת מוצר:", err.message);
    res.status(400).json({ message: err.message });
  }
});











// ✅ עדכון מוצר לפי חנות ומזהה מוצר
router.put("/:storeId/:productId", async (req, res) => {
  const { storeId, productId } = req.params;

  try {
    const store = await StoreProducts.findOne({ storeId });

    if (!store) return res.status(404).json({ message: "Store not found" });

    const productIndex = store.products.findIndex((p) => String(p._id) === productId);
    if (productIndex === -1) return res.status(404).json({ message: "Product not found" });

    store.products[productIndex] = {
      ...store.products[productIndex].toObject(),
      ...req.body,
    };

    await store.save();

    res.json(store.products[productIndex]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ מחיקת מוצר לפי חנות ומזהה מוצר
router.delete("/:storeId/:productId", async (req, res) => {
  const { storeId, productId } = req.params;

  try {
    const store = await StoreProducts.findOne({ storeId });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const originalLength = store.products.length;
    store.products = store.products.filter((p) => String(p._id) !== productId);

    if (store.products.length === originalLength) {
      return res.status(404).json({ message: "Product not found" });
    }

    await store.save();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


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

module.exports = router;
