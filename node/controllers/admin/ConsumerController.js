const ConumerService = require('../../services/admin/ConsumerService');

const ConsumerController ={
    GetMessageCount:async(req,res)=>{
        const result = await ConumerService.GetMessageCount();
        if(result) {
            res.send({
                code:200,
                data:result,
            })
        }
    },
    GetMessageList:async(req,res)=>{
        const {page,size} = req.query
        const result = await ConumerService.GetMessageList({
            page: Number(page),
            size: Number(size),
        });
        if(result) {
            res.send({
                code:200,
                data:result,
            })
        }
    },
    HandleFeedback:async(req,res)=>{
        const {_id,status,adminReply} = req.body;
        const result = await ConumerService.HandleFeedback({_id,status,adminReply});
        if(result) {
            res.send({
                code:200,
            })
        }
    },
    DeleteFeedback:async(req,res)=>{
        const {_id} = req.body;
        const result = await ConumerService.DeleteFeedback({_id});
        if(result) {
            res.send({
                code:200,
            })
        }
    }
}
module.exports = ConsumerController;