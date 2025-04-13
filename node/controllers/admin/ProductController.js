const ProductService = require("../../services/admin/ProductService");

const ProductController ={
    add:async (req,res)=>{
        const cover = req.file?`/productuploads/${req.file.filename}`:""
        const {title,introduction,detail} = req.body
        await ProductService.add({
            title,
            introduction,
            detail,
            cover,
            editTime:new Date()
        })
        res.send({
            ActionType: "OK",
        })

    },
    getList:async (req,res)=>{
        const result = await ProductService.getlist({_id:req.params.id})
        res.send({
            ActionType: "OK",
            data: result
        })
    },
    delList:async (req,res)=>{
        await ProductService.delList({_id:req.params.id})
        res.send({
            ActionType: "OK",
        })  
    },
    updatelist:async (req,res)=>{
        const cover = req.file ? `/productuploads/${req.file.filename}`:""
        const {title,introduction,detail,_id } = req.body
        await ProductService.updatelist({
            title,
            introduction,
            detail,
            cover,
            editTime:new Date(),
            _id
        })
        res.send({
            ActionType: "OK",
        })
    }

}


module.exports = ProductController