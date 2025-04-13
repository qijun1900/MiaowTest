const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    title: String,
    introduction: String,
    detail:String,
    cover:String,
    editTime:Date,
})


const ProductModel  = mongoose.model("product",ProductSchema)


module.exports = ProductModel