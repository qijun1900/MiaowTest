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
       
    }
}
module.exports = ConsumerController;