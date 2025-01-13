const Product = require('../models/Product');

const productsController = {
  // שליפת כל המוצרים
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching products: ' + err.message });
    }
  },

  // שליפת מוצר לפי ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching product: ' + err.message });
    }
  },

  // הוספת מוצר חדש
  createProduct: async (req, res) => {
    try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ error: 'Error creating product: ' + err.message });
    }
  },

  // עריכת מוצר קיים
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(400).json({ error: 'Error updating product: ' + err.message });
    }
  },

  // מחיקת מוצר
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(400).json({ error: 'Error deleting product: ' + err.message });
    }
  },
};

module.exports = productsController;
