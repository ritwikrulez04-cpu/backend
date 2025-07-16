// server.js
import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for all origins (change origin to your frontend URL if you want)
app.use(cors({
  origin: '*'
}));

app.use(express.json());

// In-memory products storage (replace with DB later)
let products = [];

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Add a new product
app.post('/api/products', (req, res) => {
  const product = req.body;
  if (!product.name || typeof product.price !== 'number') {
    return res.status(400).json({ message: 'Bad request: name and price required' });
  }
  product.id = products.length + 1;
  products.push(product);
  res.status(201).json(product);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
