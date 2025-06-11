const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../Middleware/authenticateToken");

// storage setting
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const mongoose = require("mongoose");
const StoreProducts = require("../models/Products");
const Store = require("../models/Stores");


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

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

router.get("/by-store", async (req, res) => {
  const storeId = req.query.store;

  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({ message: "Invalid or missing storeId" });
  }

  try {
    const store = await StoreProducts.findOne({
      storeId: new mongoose.Types.ObjectId(storeId),
    });
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

    if (Array.isArray(productData.categories)) {
      productData.categories = productData.categories.map(
        (id) => new mongoose.Types.ObjectId(id)
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

//update product by id
router.put("/:storeId/:productId", async (req, res) => {
  const { storeId, productId } = req.params;

  try {
    const store = await StoreProducts.findOne({ storeId });

    if (!store) return res.status(404).json({ message: "Store not found" });

    const productIndex = store.products.findIndex(
      (p) => String(p._id) === productId
    );
    if (productIndex === -1)
      return res.status(404).json({ message: "Product not found" });

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

// delete product from store by storeId and productId
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

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Step 1: Find the StoreProducts document that contains the product
    const storeProducts = await StoreProducts.findOne({ "products._id": id });
    if (!storeProducts) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: Extract the product from the matched StoreProducts document
    const product = storeProducts.products.find(
      (p) => String(p._id) === id
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 3: Fetch the actual Store document to get the 'about' field
    const store = await Store.findById(storeProducts.storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Step 4: Return the product info along with store details and multilingual 'about'
    res.json({
      ...product.toObject(),
      storeId: store._id,
      storeName: store.name,
      storeAbout: store.about, // renamed to avoid collision with product.about
      averageRating:
        product.reviews?.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0,
      totalReviews: product.reviews?.length || 0,
    });
  } catch (err) {
    console.error("Error fetching product:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/rate", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const store = await StoreProducts.findOne({ "products._id": id });
    if (!store) return res.status(404).json({ message: "Product not found" });

    const product = store.products.find((p) => String(p._id) === id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const userId = req.user.userId; // כאן בטוח יש userId כי authenticateToken דרש טוקן תקין

    const alreadyReviewed = product.reviews.some(
      (review) => review.user?.toString() === userId
    );
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already rated this product." });
    }

    product.reviews.push({
      user: userId,
      rating,
    });

    await store.save();

    const averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length;

    res.json({
      message: "Rating submitted successfully",
      product: {
        ...product.toObject(),
        averageRating,
        totalReviews: product.reviews.length,
      },
    });
  } catch (err) {
    console.error("Error updating rating:", err.message);
    res.status(500).json({ message: err.message });
  }
});
router.get("/filter-by-categories", async (req, res) => {
  try {
    const { categories } = req.query;

    if (!categories) {
      return res.status(400).json({ error: "No category ids provided" });
    }

    const categoryIds = categories
      .split(",")
      .map((id) => new mongoose.Types.ObjectId(id));

    // שליפה של כל החנויות שמכילות לפחות מוצר אחד עם אחת מהקטגוריות
    const stores = await StoreProducts.find({
      "products.categories": { $in: categoryIds },
    });

    // סינון מוצרים בכל חנות לפי הקטגוריות שנבחרו
    const filtered = stores
      .map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        products: store.products.filter((product) =>
          product.categories.some((catId) =>
            categoryIds.some((cid) => catId.equals(cid))
          )
        ),
      }))
      .filter((store) => store.products.length > 0);

    res.json(filtered);
  } catch (err) {
    console.error("Error filtering products by categories:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
