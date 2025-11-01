const FeedbackModel = require("../../models/ConsumerFeedbackModel");
const ConsumerModel = require("../../models/ConsumerModel");

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
    },
    HandleFeedback:async({_id,status,adminReply})=>{
        try{
            const result = await FeedbackModel.findByIdAndUpdate(_id,{status,adminReply});
            return true;
        }catch(error){
            console.error("处理反馈失败",error);
            throw error;
        }
    },
    DeleteFeedback:async({_id})=>{
        try{
            const result = await FeedbackModel.findByIdAndDelete(_id);
            return true;
        }catch(error){
            console.error("删除反馈失败",error);
            throw error;
        }
    },
    GetConsumerList:async({page,size})=>{
        try{
            const [data,total] = await Promise.all([
                ConsumerModel
                .find({},{
                    //排除敏感字段
                    password: 0,
                    session_key: 0,
                    favoriteExams: 0,
                    favoriteQuestions: 0,
                    wrongQuestions: 0,
                    questionbanks: 0,
                })
                .sort({createdAt:-1})// 按创建时间降序排列
               .skip((page-1) * size)
               .limit(size),
                ConsumerModel.countDocuments()
            ])
            return {data,total}
        }catch(error){
            console.error("获取用户列表失败",error);
            throw error;
        }
    }
}
module.exports = ConsumerService;