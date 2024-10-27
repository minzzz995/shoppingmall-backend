const productController={}
const Product = require("../models/Product")

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

module.exports=productController