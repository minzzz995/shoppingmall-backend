const cartController = {};
const { response } = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { populate } = require("dotenv");

// 장바구니에 아이템 추가
cartController.addToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;

    // 기존 카트가 있는지 확인
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // 카트가 없으면 새로 생성
      cart = new Cart({
        userId,
        items: [{ productId, size, qty }],
      })
      await cart.save()
    } else {
      // 기존 카트에 같은 아이템이 있는지 확인
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.equals(productId) && item.size === size
      );

      if (existingItemIndex >= 0) {
        // 이미 있는 아이템이면 수량만 증가
        cart.items[existingItemIndex].qty += qty;
      } else {
        // 없으면 새 아이템 추가
        cart.items = [...cart.items, {productId, size, qty}]
        await cart.save()
      }
    }
    // await cart.save();
    return res.status(200).json({ status: "Success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 장바구니 목록 가져오기
cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
        path: "items",
        populate: {
            path: "productId",
            model: "Product"
        }
    });

    if (!cart) {
      return res.status(200).json({ status: "Success", data: [] });
    }

    return res.status(200).json({ status: "Success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 장바구니 아이템 삭제
cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    // 해당 아이템을 장바구니에서 제거
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    return res.status(200).json({ status: "Success", message: "Item deleted" });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 장바구니 아이템 수량 업데이트
cartController.updateCartItemQty = async (req, res) => {
  try {
    const { userId } = req;
    const { itemId } = req.params;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    // 아이템 수량 업데이트
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) throw new Error("Item not found");

    item.qty = qty;
    await cart.save();

    return res.status(200).json({ status: "Success", data: cart });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 장바구니 수량 가져오기
cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    const totalQty = cart ? cart.items.reduce((total, item) => total + item.qty, 0) : 0;

    return res.status(200).json({ status: "Success", cartItemCount: totalQty });
    // if (!cart) throw new Error("There is no cart")
    // res.status(200).json({status:200, qty: cart.items.length})
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
