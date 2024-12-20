const mongoose = require("mongoose")
const Schema = mongoose.Schema
const productSchema = Schema({
    sku:{type:String, required:true, unique:true},
    name:{type:String, required:true},
    image:{type:String, required:true},
    category:{type:Array, required:true},
    price:{type:Number, required:true},
    stock:{type:Object, required:true},
    status:{type:String, default:"active"},
    description: { type: String },
    isDeleted:{type:Boolean, default:false}
}, {timestamps:true})

productSchema.method.toJSON = function () {
    const obj = this._doc
    delete obj.__v
    delete obj.updateAt
    delete obj.createAt
    return obj
}

const Product = mongoose.model("Product", productSchema)
module.exports = Product