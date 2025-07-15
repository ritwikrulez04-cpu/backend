import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const cart = await Cart.findOne();
  res.json(cart || { items: [] });
});

router.post("/", async (req, res) => {
  const { items } = req.body;
  let cart = await Cart.findOne();
  if (cart) {
    cart.items = items;
  } else {
    cart = new Cart({ items });
  }
  await cart.save();
  res.json({ message: "Cart saved" });
});

export default router;