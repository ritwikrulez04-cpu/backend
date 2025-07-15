import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
});

const cartSchema = new mongoose.Schema({
  items: [cartItemSchema],
});

export default mongoose.model("Cart", cartSchema);