import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.json({ message: "Order placed successfully!" });
});

export default router;