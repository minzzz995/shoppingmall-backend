const orderController = {};
const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../controllers/util/randomStringGenerator");

// orderController.createOrder = async (req, res) => {
//     console.log("createOrder function is being called");  // 이 줄 추가

//     try {
//       const { userId } = req;
//       const { shipTo, contact, totalPrice, orderList } = req.body;
  
//       const insufficientStockItems = await productController.checkItemListStock(orderList);
  
//       if (insufficientStockItems.length > 0) {
//         const errorMessage = insufficientStockItems.reduce((total, item) => (total += item.message), "");
//         return res.status(400).json({ status: "fail", error: errorMessage }); // Error 응답 반환
//       }

//       const newOrder = new Order({
//         userId,
//         totalPrice,
//         shipTo,
//         contact,
//         items: orderList,
//         orderNum: randomStringGenerator()
//       });
//       await newOrder.save();

//       console.log("Testing deductStock function:", typeof productController.deductStock);
//       // 재고 차감 (주문이 성공적으로 생성된 후에만 실행)
//       await productController.deductStock(orderList);

//       res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
//     } catch (error) {
//       return res.status(400).json({ status: "fail", error: error.message });
//     }
//   };
orderController.createOrder = async (req, res) => {
    // console.log("createOrder function is being called");

    try {
        const { userId } = req;
        const { shipTo, contact, totalPrice, orderList } = req.body;
        // console.log("Order request body:", req.body);

        const insufficientStockItems = await productController.checkItemListStock(orderList);
        // console.log("Insufficient stock items:", insufficientStockItems);
        
        if (insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total, item) => (total += item.message), "");
            // console.log("Stock check failed:", errorMessage);
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
        
        // console.log("Testing deductStock function:", typeof productController.deductStock);
        await productController.deductStock(orderList);

        res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
    } catch (error) {
        // console.log("Error in createOrder:", error.message);
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = orderController;
