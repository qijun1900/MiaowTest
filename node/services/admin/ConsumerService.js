const FeedbackModel = require("../../models/ConsumerFeedbackModel");
const ConsumerModel = require("../../models/ConsumerModel");
const ExamModel = require("../../models/ExamModel");

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
            .sort({createTime:-1})
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
                .sort({createTime:-1}) // 按创建时间降序排序
               .skip((page-1) * size)
               .limit(size),
                ConsumerModel.countDocuments()
            ])
            return {data,total}
        }catch(error){
            console.error("获取用户列表失败",error);
            throw error;
        }
    },
    GetAuthExamList: async ({ uid }) => {
        try {
            // 查询所有需要认证的考试
            const allAuthExams = await ExamModel.find(
                { isAuthRequired: 1 }, 
                { name: 1, createdTime: 1 }
            );
            
            // 查询用户已有的认证要求考试
            const consumer = await ConsumerModel.findById(uid);
            const userAuthExams = consumer?.AuthRequiredExams || [];
            
            // 为每个考试添加isOpenAuth字段，区分用户是否已添加
            const result = allAuthExams.map(exam => ({
                _id: exam._id,
                name: exam.name,
                createdTime: exam.createdTime,
                isOpenAuth: userAuthExams.includes(exam._id.toString())
            }));
            
            return result;
        } catch (error) {
            console.error("获取认证要求的考试列表失败", error);
            throw error;
        }
    },
    updateExamAuthStatus: async ({ uid, examId }) => {
        try {
            // 首先查询用户当前的AuthRequiredExams数组
            const consumer = await ConsumerModel.findById(uid);
            const userAuthExams = consumer?.AuthRequiredExams || [];
            
            let updateResult;
            if (userAuthExams.includes(examId)) {
                // 如果已存在，则从数组中删除
                updateResult = await ConsumerModel.findByIdAndUpdate(
                    uid,
                    { $pull: { AuthRequiredExams: examId } },
                    { new: true }
                );
            } else {
                // 如果不存在，则添加到数组中
                updateResult = await ConsumerModel.findByIdAndUpdate(
                    uid,
                    { $addToSet: { AuthRequiredExams: examId } },
                    { new: true }
                );
            }
            
            return {
                success: true,
               // AuthRequiredExams: updateResult.AuthRequiredExams
            };
        }catch (error) {
            console.error("为用户添加/删除认证考试失败", error);
            throw error;
        }
    }
}
module.exports = ConsumerService;