const productController={}
const { response } = require("express")
const Product = require("../models/Product")
const PAGE_SIZE=5

productController.createProduct = async(req, res)=>{
    try{
        let { sku, name, size, image, category, description, price, stock, status } = req.body
        const product = new Product({sku, name, size, image, category, description, price, stock, status})

        await product.save()
        return res.status(200).json({status:"Success", product})

    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

productController.getProducts = async(req, res)=>{
    try{
        const {page, name} = req.query
        const decodedName = name ? decodeURIComponent(name) : null; // 한글 디코딩 처리
        const cond = decodedName ?{name:{$regex:decodedName, $options:"i"}}:{}
        let query = Product.find(cond)
        let response = {status: "Success"}

        if(page){
            query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE) 
            const totalItemNum = await Product.countDocuments(cond)
            const totalPageNum = Math.ceil(totalItemNum/PAGE_SIZE) 
            response.totalPageNum = totalPageNum    
        }
        const productList = await query.exec();
        response.data = productList

        return res.status(200).json(response)
        
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

productController.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const {sku, name, size, image, price, description, category, stock, status} = req.body
        const product = await Product.findByIdAndUpdate({_id: productId}, {sku, name, size, image, price, description, category, stock, status}, {new:true})
        if(!product) throw new Error("item doesn't exist")
        
        res.status(200).json({status:"Success", data: product})

    } catch(error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndDelete(productId);
        if (!product) throw new Error("Product not found");

        return res.status(200).json({ status: "Success", message: "Product deleted" });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

productController.getProductDetail = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ status: "fail", error: "Product not found" });
      }
      return res.status(200).json({ status: "success", data: product });
    } catch (error) {
      return res.status(500).json({ status: "fail", error: error.message });
    }
  };

//   productController.checkStock = async (item) => {
//     const product = await Product.findById(item.productId)
//     if(product.stock[item.size] < item.qty) {
//         return {isVerify:false, message: `${product.name}의 ${item.size}재고가 부족합니다`}
//     }
//     const newStock = {...product.stock}
//     newStock[item.size] -= item.qty
//     product.stock = newStock

//     await product.save()
//     return {isVerify:true}
//   }
  productController.checkStock = async (item) => {
    const product = await Product.findById(item.productId);
    if (product.stock[item.size] < item.qty) {
      return { isVerify: false, message: `${product.name}의 ${item.size} 재고가 부족합니다.` };
    }
    return { isVerify: true };
  };

  productController.deductStock = async (itemList) => {
    await Promise.all(
      itemList.map(async (item) => {
        const product = await Product.findById(item.productId);
        const newStock = { ...product.stock };
        newStock[item.size] -= item.qty;
        product.stock = newStock;
        await product.save();
      })
    );
  };
  
  productController.checkItemListStock = async (itemList) => {
    try {
        const insufficientStockItems = []
        await Promise.all (
            itemList.map(async item=>{
                const stockCheck = await productController.checkStock(item)
                if(!stockCheck.isVerify) {
                    insufficientStockItems.push({item, message:stockCheck.message})
                }
                return stockCheck;
            })
        )
        return insufficientStockItems;
    } catch (error) {
      return res.status(500).json({ status: "fail", error: error.message });
    }
  };

module.exports=productController