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
    },
    addNoticebar: async (req,res)=>{
        await NewsService.addNoticebar({
            ...req.body,
            editTime:new Date()
        }) 
        res.send({
            code:200,
            ActionType: "OK", 
        })
    },
    getNoticebar: async (req,res)=>{
        const result = await NewsService.getNoticebar()
        res.send({
            code:200,
            ActionType: "OK",
            data: result
        })
    },
    ChangeStateNoticebar: async (req,res)=>{
        await NewsService.ChangeStateNoticebar({...req.body,editTime:new Date()})
        res.send({
            code:200,
            ActionType: "OK",
        })
    },
    delNoticebar:async(req,res)=>{
        await NewsService.delNoticebar({_id:req.params.id})
        res.send({
            code:200,
            ActionType: "OK",
        })
    },
    getUpdatNoticebar:async(req,res)=>{
        const {content,_id} = req.body
        console.log(content,_id)
        const result = await NewsService.getUpdatNoticebar({
            content,
            _id,
            editTime:new Date()
        }) 
        res.send({
            code:200,
            ActionType: "OK",
            data: result 
        })
    },
     addAnnouncement:async (req,res)=>{
        const cover = req.file?`/newsuploads/${req.file.filename}`:""
        const {title,content,category,isPublish,creator } = req.body
        console.log(title,content,category,isPublish,cover)
        await NewsService.addAnnouncement({
            title,
            content,
            category:Number(category),
            isPublish:Number(isPublish),
            cover,
            creator,
            editTime:new Date()
        })
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    getAnnouncementList:async (req,res)=>{
        const {page,size} = req.query
        const result = await NewsService.getAnnouncementList({
            page: Number(page),
            size: Number(size)
        })
        res.send({
            ActionType: "OK",
            data: result,
            code:200,
        })
    },
    DeleteOneAnnouncement:async (req,res)=>{
        const {_id} = req.body
        await NewsService.DeleteOneAnnouncement({_id})
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    DeleteManyAnnouncement:async (req,res)=>{
        const {_ids} = req.body
        await NewsService.DeleteManyAnnouncement({_ids})
        res.send({
            ActionType: "OK",
            code:200,
        })
    },
    updateStatus:async (req,res)=>{
        const {_id,state} = req.body
        await NewsService.updateStatus({_id,state})
        res.send({
            ActionType: "OK",
            code:200,
        })
        
    }
}


module.exports = NewsController