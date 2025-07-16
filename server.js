import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';  // <-- Add this

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Mount auth routes at /api/auth
app.use('/api/auth', authRoutes);

// (keep your other routes here like /api/products, etc.)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
