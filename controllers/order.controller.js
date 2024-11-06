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
    //   console.log("randomStringGenerator:", randomStringGenerator); // 함수가 올바르게 로드되었는지 확인

      const newOrder = new Order({
        userId,
        totalPrice,
        shipTo,
        contact,
        items: orderList,
        orderNum: randomStringGenerator()
      });
      await newOrder.save();
      res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
    } catch (error) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  };

module.exports = orderController;
