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
module.exports=productController