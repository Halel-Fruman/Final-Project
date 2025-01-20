const express = require('express');
const Store = require('../models/Stores'); // ייבוא המודל של החנויות
const router = express.Router();

// נתיב לשליפת כל החנויות
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find(); // שליפת כל החנויות מה-DB
    res.status(200).json(stores); // החזרת החנויות ב-json
  } catch (error) {
    console.log("hi");
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// נתיב להוספת חנות חדשה
router.post('/', async (req, res) => {
  const { name, address, email, manager } = req.body; // פרטי החנות החדשה

  try {
    const newStore = new Store({ name, address, email, manager });
    await newStore.save(); // שמירת החנות החדשה ב-DB
    res.status(201).json(newStore); // החזרת החנות החדשה כ-json
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בהוספת החנות' });
  }
});

// עדכון פרטי חנות
router.put('/:id', async (req, res) => {
    const { name, address, email, manager } = req.body;
    try {
      const updatedStore = await Store.findByIdAndUpdate(
        req.params.id,
        { name, address, email, manager }, // עדכון כל השדות, כולל המנהלים
        { new: true }
      );
      res.status(200).json(updatedStore);
    } catch (error) {
      res.status(500).json({ error: 'Error updating store: ' + error.message });
    }
  });

// נתיב למחיקת חנות
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // מזהה החנות שברצוננו למחוק

  try {
    const deletedStore = await Store.findByIdAndDelete(id);
    if (!deletedStore) return res.status(404).json({ message: 'חנות לא נמצאה' });
    res.status(200).json({ message: 'החנות נמחקה בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת החנות' });
  }
});

// חיפוש חנות לפי ID
router.get('/:id', async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ error: 'Store not found' });
      res.status(200).json(store);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching store: ' + error.message });
    }
  });

module.exports = router; // ייצוא הנתיב
