const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuseModel.js')
const NewsModel = require('../../models/NewsModel')
const UserFeedbackModel = require('../../models/UserFeedbackModel')


const ExamService = {
    getExamList: async () => {
        return await ExamModel.find({isPublish:1}).sort({createdTime:-1})
    },
    getOneExam: async (id) => {
        return await ExamModel.findById(id)
    },
    getUserExamInfo: async (id) => {
        // 使用聚合管道来过滤数组元素
        return await UserExamModel.aggregate([
            {
                // 先匹配 examId 条件
                $match: {
                    examId: id
                }
            },
            {
                // 再使用 $filter 操作符过滤 questionTitle 数组，选择 isPublishType 为 1 的元素
                $project: {
                    questionTitle: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$questionTitle",
                                    as: "title",
                                    cond: { $eq: ["$$title.isPublishType", 1] }
                                }
                            },
                            as: "filteredTitle",
                            in: {
                                $mergeObjects: [
                                    "$$filteredTitle",
                                    {
                                        questionIdS: {
                                            $map: {
                                                input: "$$filteredTitle.questionIdS",
                                                as: "question",
                                                in: [ "$$question" ] // 将每个元素包裹到数组中
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]);
       //return await UserExamModel.find({examId:id},{questionTitle:1})
    },
    postUserExamIssuse: async (ExamId, ExamtagId,Type, createdTime) => {
        return await UserIssuseModel.create({ 
            ExamId,
            ExamtagId, 
            Type, 
            IsSolved,
            createdTime});
    },
    getSwipeNews: async () => {
        return await NewsModel.find({isPublish:1}).sort({createdTime:-1})
    },
    UserFeedbackAdvice: async ({useradvice,userinfo,type,IsSolved,createtime}) => {
        return await UserFeedbackModel.create({
            userAdvice:useradvice,
            userInfo:userinfo,
            Type:type,
            IsSolved,
            createdTime:createtime
        })
        
    },
    postUserQuestionIssuse: async ({ExamtagId,Type,userQuestion,stem,questionId,ExamId,IsSolved,createdTime}) => {
        return await UserIssuseModel.create({
            ExamtagId,Type,userQuestion,stem,questionId,ExamId,IsSolved,createdTime
        })
    },
    getHotExamList: async () => {
        return await ExamModel.find({isPublish:1},{
            isPublish:0,
            creator:0,
            category:0,
        }).sort({createdTime:-1}).limit(7)
    }

}
module.exports = ExamService