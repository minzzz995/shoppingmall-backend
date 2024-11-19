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
  
    const { ordernum, page = 1, limit = 3 } = req.query;
    const query = {};
  
    // if (ordernum) {
    //   query.orderNum = ordernum;
    // }
      // ordernum이 있으면 정규 표현식으로 부분 검색 설정
    if (ordernum) {
      query.orderNum = { $regex: ordernum, $options: "i" }; // 대소문자 구분 없이 검색
    }
    
    try {
      const orders = await Order.find(query)
        .populate("items.productId", "name")
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const totalOrders = await Order.countDocuments(query);
      const totalPageNum = Math.ceil(totalOrders / limit);

      return res.status(200).json({ status: "success", data: orders, totalPageNum });
    } catch (error) {
      return res.status(500).json({ status: "fail", error: error.message });
    }
  };

// 주문 상태 업데이트
orderController.updateOrderStatus = async (req, res) => {
    if (req.user.level !== "admin") {
      return res.status(403).json({ status: "fail", error: "Access denied" });
    }
  
    const { id, status } = req.body;
  
    try {
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!order) {
        return res.status(404).json({ status: "fail", error: "Order not found" });
      }
  
      return res.status(200).json({ status: "success", data: order });
    } catch (error) {
      return res.status(500).json({ status: "fail", error: error.message });
    }
  };
  
module.exports = orderController;
