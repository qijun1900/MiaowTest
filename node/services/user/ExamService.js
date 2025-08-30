const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuseModel.js')
const NewsModel = require('../../models/NewsModel')
const UserFeedbackModel = require('../../models/UserFeedbackModel')
const ExamSelectModel = require('../../models/SelectModel')
const ExamBlankModel = require('../../models/BlankModel')
const ExamJudgeModel = require('../../models/JudgeModel')
const ExamShortModel = require('../../models/ShortModel')

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
    // uniappAPI
    getHotExamList: async () => {
        return await ExamModel.find({isPublish:1},{
            isPublish:0,
            creator:0,
            category:0,
        }).sort({createdTime:-1}).limit(7)
    },
    getExamSubjects: async () => {
        return await ExamModel.find({isPublish:1},{
            cover:1,
            name:1,
            _id:1,
            createdTime:1,
            day:1,
            year:1,
        }).sort({createdTime:-1})
    },
    getExamSubjectTypes: async (id) => {
        return await UserExamModel.aggregate([// 聚合查询
            { $match: { examId: id } }, // 匹配 examId 为指定 id 的文档
            { $unwind: "$questionTitle" }, // 先展开数组
            { $match: { "questionTitle.isPublish": 1 } }, // 然后筛选 isPublish 为 1 的文档(代表考试题型发布)
            {
                $project:{
                    content: "$questionTitle.content",// 提取 questionTitle 中的 content 字段
                    questionIdS: "$questionTitle.questionIdS",// 提取 questionTitle 中的 questionIdS 字段
                    _id: 0// 不显示 _id 字段
                }
            }
        ])
    },
    FetchMatchQuestionList: async (extractedData) => {
         const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        }
        // 使用Promise.all并发查询每个ID对应的题目
        const results = await Promise.all(
            extractedData.map(({_id, category}) => {
                const model = modelMap[category];
                return model.findById(_id);
            })
        )
         return results.filter(Boolean); // 过滤掉null结果
    }
        
        
    
}
module.exports = ExamService