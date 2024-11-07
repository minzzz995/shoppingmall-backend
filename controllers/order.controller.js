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
        return res.status(400).json({ status: "fail", error: errorMessage }); // Error 응답 반환
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

      // 재고 차감 (주문이 성공적으로 생성된 후에만 실행)
      await productController.deductStock(orderList);
      res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
    } catch (error) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  };

module.exports = orderController;
