// File: routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const Store = require("../models/Stores");
const Transactions = require("../models/Transactions");
const authenticateToken = require("../Middleware/authenticateToken");

// GET /api/analytics/store-sales
// Returns sales and order stats for each store (optionally filtered by date range)
router.get("/store-sales", authenticateToken, async (req, res) => {
  const { from, to } = req.query;

  try {
    const matchStage = {};
    if (from || to) {
      matchStage["transactions.createdAt"] = {};
      if (from) matchStage["transactions.createdAt"].$gte = new Date(from);
      if (to) matchStage["transactions.createdAt"].$lte = new Date(to);
    }

    const stats = await Transactions.aggregate([
      { $unwind: "$transactions" },
      { $match: matchStage },
      {
        $group: {
          _id: "$storeId",
          storeName: { $first: "$storeName" },
          totalRevenue: { $sum: "$transactions.totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching store sales stats:", error);
    res.status(500).json({ error: "Failed to fetch sales statistics" });
  }
});

router.get("/top-products", authenticateToken, async (req, res) => {
  try {
    const { from, to } = req.query;

    const matchStage = {};
    if (from || to) {
      matchStage["transactions.createdAt"] = {};
      if (from) matchStage["transactions.createdAt"].$gte = new Date(from);
      if (to) matchStage["transactions.createdAt"].$lte = new Date(to);
    }

    const topProducts = await Transactions.aggregate([
      { $unwind: "$transactions" },
      { $match: matchStage },
      { $unwind: "$transactions.products" },
      {
        $group: {
          _id: "$transactions.products.productId",
          name: { $first: "$transactions.products.name" },
          storeName: { $first: "$storeName" },
          price: { $first: "$transactions.products.price" },
          totalSold: { $sum: "$transactions.products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

module.exports = router;
