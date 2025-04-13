const ProductModel = require('../../models/ProductModel')
const ProductService ={
    add: async ({title,introduction,detail,cover,editTime})=>{
        return ProductModel.create({
            title,
            introduction,
            detail,
            cover,
            editTime,
        })
    },
    getlist:async ({_id})=>{
        return _id?ProductModel.find({_id}):ProductModel.find({}) 
    },
    delList: async ({_id})=>{
        return ProductModel.deleteOne({_id})
    },
    updatelist: async ({title,introduction,detail,cover,editTime,_id})=>{
        if(cover){
            return ProductModel.updateOne({_id},{
                title,introduction,detail,cover,editTime
            })
        }else{
            return ProductModel.updateOne({_id},{
                title,introduction,detail,editTime
            })
        }
    },
}

module.exports = ProductService 