const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post('/', async (req, res) => {
  try {
    const { id, name, price, description, image } = req.body;

    if (!id || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = new Product({ id, name, price, description, image });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

module.exports = router;
