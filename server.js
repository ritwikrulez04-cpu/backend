import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());        // Enable CORS for all origins
app.use(express.json());

// Example products array (or replace with your DB logic)
let products = [];

// GET all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// POST a product
app.post('/api/products', (req, res) => {
  const product = req.body;
  if (!product.name || !product.price) {
    return res.status(400).json({ message: 'Bad request' });
  }
  products.push(product);
  res.json(product);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
