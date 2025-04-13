const NewsService = require("../../services/admin/NewsService");

const NewsController ={
    add:async (req,res)=>{
        const cover = req.file?`/newsuploads/${req.file.filename}`:""
        const {tittle,content,category,isPublish } = req.body
        await NewsService.add({
            tittle,
            content,
            category:Number(category),
            isPublish:Number(isPublish),
            cover,
            editTime:new Date()
        })
        res.send({
            ActionType: "OK",
        })
    },
    getList:async (req,res)=>{
        const result = await NewsService.getlist({_id:req.params.id})
        res.send({
            ActionType: "OK",
            data: result
        })

    },
    publish:async (req,res)=>{
        await NewsService.publish({
            ...req.body,
            editTime:new Date()
        })
        res.send({
            ActionType: "OK",
        })
    },
    delList: async (req,res)=>{
        await NewsService.delList({_id:req.params.id})
        res.send({
            ActionType: "OK",
        })
    },
    updatelist: async (req,res)=>{
        const cover = req.file?`/newsuploads/${req.file.filename}`:""
        const {tittle,content,category,isPublish,_id } = req.body
        await NewsService.updatelist({
            tittle,
            content,
            category:Number(category),
            isPublish:Number(isPublish),
            cover,
            editTime:new Date(),
            _id
        })
        res.send({
            ActionType: "OK",
        })
    }
}


module.exports = NewsController