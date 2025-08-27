const NewsService = require("../../services/admin/NewsService");

const NewsController ={
     addAnnouncement:async (req,res)=>{
        const cover = req.file?`/newsuploads/${req.file.filename}`:""
        const {title,content,category,isPublish,creator } = req.body
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