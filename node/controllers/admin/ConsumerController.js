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
        console.log("sss",page,size)
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
    }
}
module.exports = ConsumerController;