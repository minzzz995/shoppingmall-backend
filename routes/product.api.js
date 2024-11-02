const express = require('express')
const router = express.Router()
const authController = require("../controllers/auth.controller")
const productController = require("../controllers/product.controller")

router.post("/", authController.authenticate, authController.checkAdminPermission, productController.createProduct)
router.get("/", productController.getProducts)
router.put("/:id", authController.authenticate, authController.checkAdminPermission, productController.updateProduct)
router.delete("/:id", authController.authenticate, authController.checkAdminPermission, productController.deleteProduct);
router.get("/:id", productController.getProductDetail); // 상품 상세 조회 엔드포인트 추가

module.exports=router;
