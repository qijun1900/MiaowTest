const FeedbackModel = require("../../models/ConsumerFeedbackModel");

const ConsumerService = {
    GetMessageCount:async()=>{
        try{
            const result = await FeedbackModel.find({
                status:0,
            }).countDocuments();
            return result;
        }catch(error){
            console.error("获取用户消息数量失败",error);
            throw error;
        }
    }
}
module.exports = ConsumerService;