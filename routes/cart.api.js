const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// POST /api/cart - Add item to cart
router.post("/", cartController.addToCart);

// GET /api/cart/quantity - Get cart item quantity
router.get("/quantity", cartController.getCartQty);

module.exports = router;
