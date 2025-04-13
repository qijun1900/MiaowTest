const NewsService = require("../../services/web/NewsService");

const NewsController ={
    getList:async (req,res)=>{
        const result = await NewsService.getlist({_id:req.params.id})
        res.send({
            ActionType: "OK",
            data: result
        })

    },
    getTopList: async (req,res)=>{
        const result = await NewsService.getToplist({limit:req.query.limit})
        res.send({
            ActionType: "OK",
            data: result
        })

    }



}

module.exports = NewsController

