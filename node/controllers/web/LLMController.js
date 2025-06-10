const LLMService = require("../../services/web/LLMService");

const LLMController ={
        sendExamAIanalyse:async (req,res)=>{
        try {
            const { message, QuestionID ,Type} = req.body; // 从请求体中获取问题和题目ID,如果QuestionID不存在，则调用大模型api获得
            console.log("用户输入的问题:", message, "题目ID:", QuestionID, "题目类型:", Type);
            const result = await LLMService.sendExamAIanalyse(message, QuestionID,Type); // 调用服务层的sendExamAIanalyse方法
            console.log(result); // 打印服务层的响应结果
            res.send({
                code: 200,
                ActionType: "OK",
                data: result ,// 返回服务层的响应结果
               
            });
        } 
        catch (error) {
            console.error('Error fetching sendExamAIanalyse details:', error); // 处理错误
        }
    },
    UserChat:async (req,res)=>{
        try {
            const {message,model} = req.body; // 从请求体中获取问题和题目ID,如果QuestionID不存在，则调用大模型api获得
            console.log("用户输入的问题:", message, "模型:", model);
            const result = await LLMService.UserChat(message,model) 
            res.send({
                code: 200,
                ActionType: "OK",
                data: result // 返回服务层的响应结果 
            })
        } catch (error) {
            console.error('Error fetching UserChat details:', error); // 处理错误 
        }
    },
    getLLMList:async (req,res)=>{
        try {
            const result = await LLMService.getLLMList() // 调用服务层的getLLMList方法 
            res.send({
                code: 200,
                ActionType: "OK",
                data: result // 返回服务层的响应结果
            })
        } catch (error) {
            console.error('Error fetching getLLMList details:', error); // 处理错误
        }
        
    }

}
module.exports = LLMController
