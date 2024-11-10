const orderController = {};
const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../controllers/util/randomStringGenerator");

orderController.createOrder = async (req, res) => {

    try {
        const { userId } = req;
        const { shipTo, contact, totalPrice, orderList } = req.body;

        const insufficientStockItems = await productController.checkItemListStock(orderList);
        
        if (insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total, item) => (total += item.message), "");
            return res.status(400).json({ status: "fail", error: errorMessage });
        }

        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items: orderList,
            orderNum: randomStringGenerator()
        });
        await newOrder.save();
        
        await productController.deductStock(orderList);

        res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 사용자 주문 목록 조회
orderController.getOrder = async (req, res) => {
    try {
        const { userId } = req; // 인증을 통해 얻은 사용자 ID
        const orders = await Order.find({ userId }); // userId로 주문 조회

        if (!orders || orders.length === 0) {
            return res.status(200).json({ status: "success", data: [] }); // 주문이 없을 때 빈 배열 반환
        }

        return res.status(200).json({ status: "success", data: orders }); // 주문 목록 반환
    } catch (error) {
        return res.status(500).json({ status: "fail", error: error.message });
    }
};

orderController.getAllOrders = async (req, res) => {
    if (req.user.level !== "admin") {
        return res.status(403).json({ status: "fail", error: "Access denied" });
    }
    
    try {
        const orders = await Order.find({}); // 모든 주문을 조회
        return res.status(200).json({ status: "success", data: orders });
    } catch (error) {
        return res.status(500).json({ status: "fail", error: error.message });
    }
};

module.exports = orderController;
