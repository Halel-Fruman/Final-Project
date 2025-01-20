const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// 📌 קבלת כל הקטגוריות
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת הקטגוריות", error });
  }
});

// 📌 קבלת קטגוריה לפי ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "קטגוריה לא נמצאה" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בקבלת הקטגוריה", error });
  }
});

// 📌 יצירת קטגוריה חדשה
router.post("/", async (req, res) => {
  const { en, he } = req.body.name;
  if (!en || !he) {
    return res.status(400).json({ message: "יש להזין שם באנגלית ובעברית" });
  }

  try {
    const newCategory = new Category({ name: { en, he } });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: "שגיאה ביצירת קטגוריה", error });
  }
});

// 📌 עדכון קטגוריה לפי ID
router.put("/:id", async (req, res) => {
  const { en, he } = req.body.name;
  if (!en || !he) {
    return res.status(400).json({ message: "יש להזין שם באנגלית ובעברית" });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name: { en, he } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "קטגוריה לא נמצאה" });
    }

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בעדכון הקטגוריה", error });
  }
});

// 📌 מחיקת קטגוריה לפי ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "קטגוריה לא נמצאה" });
    }
    res.json({ message: "הקטגוריה נמחקה בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "שגיאה במחיקת הקטגוריה", error });
  }
});

module.exports = router;
