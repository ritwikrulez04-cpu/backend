// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// routers
import authRouter from './routes/auth.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import checkoutRouter from './routes/checkout.js';

// load .env into process.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// global middleware
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);

// health check
app.get('/', (req, res) => res.send('API is up and running'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
