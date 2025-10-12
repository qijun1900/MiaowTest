const ExamService = require("../../services/user/ExamService");

const ExamController ={
    //uniappAPI
    getHotExamList:async (req,res)=>{
        try {
            const result = await ExamService.getHotExamList()
            res.send({
                code:200,
                data: result 
            })
        }
        catch (error) {
            console.error('Error fetching getHotExamList details:', error); // 处理错误
        }
    },
    getExamSubjects:async (req,res)=>{
        try {
            const result = await ExamService.getExamSubjects()
            res.send({
                code:200,
                data: result 
            })
        }catch (error) {
            console.error('Error fetching getExamSubjects details:', error); // 处理错误
        }
    },
    getExamSubjectTypes:async (req,res)=>{
        try {
            const ExamSubjectId = req.params.id; // 从请求参数中获取ExamSubjectId
            const result = await ExamService.getExamSubjectTypes(ExamSubjectId) 
            res.send({
                code:200,
                data: result
            })
        }catch (error) {
            console.error('Error fetching getExamSubjectTypes details:', error); // 处理错误
        }
    },
    FetchMatchQuestionList:async (req,res)=>{
        try {
            const extractedData = req.body; 
            const result = await ExamService.FetchMatchQuestionList(extractedData) 
            res.send({
                code: 200,
                data: result
            });
        }catch (error) {
            console.error('Error fetching FetchMatchQuestionList details:', error); // 处理错误
        }
    },
    useraddquestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const {questionData} = req.body;
            const result = await ExamService.useraddquestion(
                uid, // 用户ID
                questionData, // 问题数据对象
            )
           if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    message: result.message,
                });
            }else{
                res.send({
                    code: result.code,
                    message: result.message,
                });
            }
             
        }catch (error) {
            console.error('Error fetching useraddquestion details:', error); // 处理错误

        }
    },
    AddUserBank:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { bankName } = req.body; // 从请求体中获取bankName
            const result = await ExamService.AddUserBank(uid, bankName);
            
            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(result.code).send({
                    code: result.code,
                    message: result.message,
                });
            }
        }catch (error) {
            console.error('Error fetching AddUserBank details:', error); // 处理错误
            res.status(500).send({
                code: 500,
                message: '服务器内部错误',
            });
        }
    },
    getUserBankList:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const result = await ExamService.getUserBankList(uid)
            if (result.success) {
                res.send({
                    code: 200,
                    data: result.data
                });
            }else{
                res.send({
                    code: 401
                });
            }
        }catch (error) {
            console.error('Error fetching getUserBankList details:', error); // 处理错误
        }
    },
    getUserBankQuestionList:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const bankId = req.params.id;//获取题库id
            console.log("uid",uid,"bankId",bankId);
            const result = await ExamService.getUserBankQuestionList(uid,bankId)
            res.send({
                code:200,
                data: result.data
            })  
            
        }catch (error) {
            console.error('Error fetching getUserBankQuestionList details:', error); // 处理错误
        }
    },
    userUpdateQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { questionData } = req.body; // 从请求体中获取questionData
            if(!uid){
                res.send({
                    code: 401,
                    message: "您未登录",
                })
                return;
            }
            if(!questionData._id){
                res.send({
                    code: 400,
                    message: "更新错误",
                })
                return;
            }
            const result = await ExamService.userUpdateQuestion(questionData)
            res.send({
                code: 200,
                message: result.message,
            });
        }catch (error) {
            console.error('Error fetching userUpdateQuestion details:', error); // 处理错误
        }
    },
    userDeleteQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { questionId , bankId} = req.body; // 从请求体中获取questionId,bankId
            if(!uid&&!questionId&&!bankId){
                res.send({
                    code: 401,
                    message: "删除错误",
                })
                return;
            }
            const result = await ExamService.userDeleteQuestion({uid,questionId,bankId})
            res.send({
                code: result.code,
                message: result.message
            });
        }catch (error) {
            console.error('Error fetching userDeleteQuestion details:', error); // 处理错误
        }
    },
    userDeleteBank:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { bankId } = req.body; // 从请求体中获取bankId
            if(!uid&&!bankId){
                res.send({
                    code: 401,
                    message: "删除错误",
                })
                return;
            }
            const result = await ExamService.userDeleteBank({uid,bankId})
            res.send({
                code: result.code,
                message: result.message
            })
        }catch (error) {
            console.error('Error fetching userDeleteBank details:', error); // 处理错误
        }
    },
    userAddWrongQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { questionId, examId,Type } = req.body; // 从请求体中获取questionId,examId,Type
            const result = await ExamService.useraddwrongquestion({uid,questionId,examId,Type})
            res.send({
                code: result.code,
                message: result.message
            })
            
        }catch (error) {
            
        }
    },
    userDeleteWrongQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { questionId } = req.body; 
            const result = await ExamService.userDeleteWrongQuestion({uid,questionId})
            res.send({
                code: result.code,
                message: result.message
            })
            
        }catch (error) {
            console.error('Error fetching userDeleteWrongQuestion details:', error); // 处理错误

        }
    },
    userAddFavoriteQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { questionId, examId,Type } = req.body; // 从请求体中获取questionId,examId,Type
            const result = await ExamService.useraddfavoritequestion({uid,questionId,examId,Type})
            res.send({
                code: result.code,
                message: result.message
            })

        }catch (error) {
            console.error('Error fetching userAddFavoriteQuestion details:', error); // 处理错误
        }
    },
    userDeleteFavoriteQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const { questionId } = req.body; // 从请求体中获取questionId
            const result = await ExamService.userDeleteFavoriteQuestion({uid,questionId})  
            res.send({
                code: result.code,
                message: result.message
            })     
        }catch (error) {
            console.error('Error fetching userDeleteFavoriteQuestion details:', error); // 处理错误
        }
    },
    getUserFavoriteQuestionList:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const result = await ExamService.getUserFavoriteQuestionList(uid)
            res.send({
                code:result.code,
                data: result.data
            })
            
        }catch (error) {
            console.error('Error fetching getUserFavoriteQuestionList details:', error); // 处理错误
        }
    },
    userPracticeFavoriteQuestion:async (req,res)=>{
        try {
            const { uid } = req.user;
            const { Type,questionId } = req.body; // 从请求体中获取questionId
            const result = await ExamService.userPracticeFavoriteQuestion({
                uid,
                Type,
                questionId
            })
            res.send({
                code: result.code,
                data: result.data, // 返回的数据
            })
            
        }catch (error) {
            console.error('Error fetching userPracticeFavoriteQuestion details:', error); // 处理错误
        }
    },
    getUserWrongQuestionList:async (req,res)=>{
        try {
            const { uid } = req.user;//获取用户openid
            const result = await ExamService.getUserWrongQuestionList(uid)
            res.send({
                code:result.code,
                data: result.data
            })
            
        }catch (error) {
            console.error('Error fetching getUserWrongQuestionList details:', error); // 处理错误
        }
    }
}

module.exports = ExamController