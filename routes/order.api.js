const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller")
const orderController = require("../controllers/order.controller")

router.post("/", authController.authenticate, orderController.createOrder);
router.get("/", authController.authenticate, orderController.getOrder);
router.get("/all", authController.authenticate, authController.checkAdminPermission, orderController.getAllOrders);
router.put("/update-status", authController.authenticate, authController.checkAdminPermission, orderController.updateOrderStatus);

module.exports = router;
