const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const  UserIssuseModel = require('../../models/UserIssuseModel.js')
const NewsModel = require('../../models/NewsModel')
const UserFeedbackModel = require('../../models/UserFeedbackModel')
const ExamSelectModel = require('../../models/SelectModel')
const ExamBlankModel = require('../../models/BlankModel')
const ExamJudgeModel = require('../../models/JudgeModel')
const ExamShortModel = require('../../models/ShortModel')
const userQuestionModel = require('../../models/UserQuestionModel')

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
    },
    useraddquestion: async (uid, questionData) => {
        try {
            // 构建基础数据对象
            const newQuestion = {
                Uid: uid,
                stem: questionData.stem,
                Type: questionData.Type,
                analysis: questionData.analysis || '', 
                status: 0, // 默认为草稿状态
                createTime: new Date()
            };
            
            // 如果有题库ID，添加到题目中
            if (questionData.questionbankId) {
                newQuestion.questionbankId = questionData.questionbankId;
            }
            
            // 根据题目类型添加特定字段
            switch (questionData.Type) {
                case 1: // 选择题
                    newQuestion.options = questionData.options;
                    newQuestion.isMultiple = questionData.isMultiple || 0;
                    break;
                case 2: // 填空题
                    newQuestion.options = questionData.options;
                    break;
                case 3: // 判断题
                    newQuestion.answer = questionData.answer;
                    break;
                case 4: // 简答题
                    newQuestion.content = questionData.content;
                    break;
                default:
                    throw new Error('无效的题目类型');
            }
            
            const result = await userQuestionModel.create(newQuestion);
            
            // 如果题目关联了题库，更新题库的题目计数
            if (questionData.questionbankId) {
                const ConsumerModel = require('../../models/ConsumerModel');
                await ConsumerModel.updateOne(
                    { _id: uid, 'questionbanks._id': questionData.questionbankId },// 查找用户的指定题库
                    { $inc: { 'questionbanks.$.questionCount': 1 } }// 增加 questionCount 字段的值
                );
            }
            
            return{
                success:true,
                message:'题目添加成功',
            }
        } catch (error) {
            console.error('添加用户题目失败:', error);
            return{
                success:false,
                message:'题目添加失败',
                code:500
            }
        }
    },
    AddUserBank: async (uid, bankName) => {
        try {
            const ConsumerModel = require('../../models/ConsumerModel');
            
            // 查找用户
            const user = await ConsumerModel.findById(uid);
            
            if (!user) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                };
            }
            
            // 检查题库名称是否已存在
            const bankExists = user.questionbanks.some(bank => bank.bankName === bankName);// 检查是否存在同名题库，some() 方法用于检查数组中是否至少有一个元素通过了指定的测试函数。
            if (bankExists) {
                return {
                    code: 400,
                    message: '题库名称已存在',
                    success: false
                };
            }
            
            // 添加新题库
            const newBank = {
                bankName: bankName,
                description: '',
                createTime: new Date(),
                questionCount: 0,
                isPublic: false
            };
            
            user.questionbanks.push(newBank);
            
            // 保存用户信息
            await user.save();
            
            // 获取新添加的题库ID（最后一个元素）
            const newBankId = user.questionbanks[user.questionbanks.length - 1]._id;
            
            return {
                code: 200,
                message: '题库添加成功',
                success: true,
                data: {
                    bankId: newBankId
                }
            };
        } catch (error) {
            console.error('AddUserBank 失败:', error);
            return {
                code: 500,
                message: '添加题库失败',
                error: error.message,
                success: false
            };
        }
    },
    getUserBankList: async (uid) => {
        try {
            const ConsumerModel = require('../../models/ConsumerModel');
            // 查找用户
            const user = await ConsumerModel.findById(uid);
            if (!user) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                };
            }
            // 返回用户的题库列表
            return {
                success: true,
                data: user.questionbanks.map(bank => ({
                    bankName: bank.bankName,
                    questionCount: bank.questionCount,// 返回每个题库的题目数量
                    bankId: bank._id, // 返回每个题库的ID
                    createTime: bank.createTime,
                }))
            };
        }catch (error) {
            console.error('getUserBankList 失败:', error);
        }
    },
    getUserBankQuestionList: async (uid, bankId) => {
        try {
            const questions = await userQuestionModel.find({ Uid: uid, questionbankId: bankId });// 查找用户的指定题库     
            if (!questions || questions.length === 0) {
                return {
                    code: 404,
                    message: '题库不存在或题库为空',
                    success: true,
                    data: []
                };
            }
            
            // 根据题型格式化返回数据
            const formattedQuestions = questions.map(question => {
                const baseData = {
                    _id: question._id,
                    stem: question.stem,
                    Type: question.Type,
                    analysis: question.analysis,
                    createTime: question.createTime,
                };
                
                // 根据题型添加特定字段
                switch (question.Type) {
                    case 1: // 选择题
                        return {
                            ...baseData,
                            options: question.options,
                            isMultiple: question.isMultiple,
                            typeName: '选择题'
                        };
                    case 2: // 填空题
                        return {
                            ...baseData,
                            options: question.options,
                            typeName: '填空题'
                        };
                    case 3: // 判断题
                        return {
                            ...baseData,
                            answer: question.answer,
                            typeName: '判断题'
                        };
                    case 4: // 简答题
                        return {
                            ...baseData,
                            content: question.content,
                            typeName: '简答题'
                        };
                    default:
                        return {
                            ...baseData,
                            typeName: '未知题型'
                        };
                }
            });
            
            return {
                success: true,
                data: formattedQuestions
            };
            
        } catch (error) {
            console.error('getUserBankQuestionList 失败:', error);
            return {
                code: 500,
                message: '获取题库题目失败',
                success: false,
                error: error.message
            };
        }
    }
        
    
}
module.exports = ExamService