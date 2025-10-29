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
    },
    GetMessageList:async({
        page, size
    })=>{
        try{
           const [data,total] = await Promise.all([
            FeedbackModel
            .find()
            .sort({createdAt:-1})
            .skip((page-1)*size)
            .limit(size),
            FeedbackModel.countDocuments()])
           return {data,total}
        }catch(error){
            console.error("获取用户消息列表失败",error);
            throw error;
        }
        
    }
}
module.exports = ConsumerService;