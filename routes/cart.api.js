const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller")

// POST /api/cart - Add item to cart
router.post("/", authController.authenticate, cartController.addToCart);
router.delete("/:itemId", authController.authenticate, cartController.deleteCartItem);
router.patch("/:itemId/qty", authController.authenticate, cartController.updateCartItemQty);
router.get("/", authController.authenticate, cartController.getCart);

router.get("/qty", authController.authenticate, cartController.getCartQty);
module.exports = router;
