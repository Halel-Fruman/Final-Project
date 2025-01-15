const express = require('express');
const productsController = require('../Controllers/productsController');

const router = express.Router();

// נתיב לשליפת כל המוצרים
router.get('/', productsController.getAllProducts);

// נתיב לשליפת מוצר לפי ID
router.get('/:id', productsController.getProductById);

// נתיב להוספת מוצר חדש
router.post('/', productsController.createProduct);

// נתיב לעריכת מוצר קיים
router.put('/:id', productsController.updateProduct);

// נתיב למחיקת מוצר
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
