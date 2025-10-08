const ExamModel = require('../../models/ExamModel')
const  UserExamModel = require('../../models/UserExamModel')
const ExamSelectModel = require('../../models/SelectModel')
const ExamBlankModel = require('../../models/BlankModel')
const ExamJudgeModel = require('../../models/JudgeModel')
const ExamShortModel = require('../../models/ShortModel')
const userQuestionModel = require('../../models/UserQuestionModel')
const ConsumerModel = require('../../models/ConsumerModel');

const ExamService = {
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
    },
    userUpdateQuestion: async (updatedData) => {
        try {
            const { _id, questionbankId, ...updateFields } = updatedData; // 解构出 _id 和 questionbankId，其他字段作为更新内容
            // 查找并更新题目
            const result = await userQuestionModel.findByIdAndUpdate(
                _id, // 题目ID
                { $set: updateFields }, // 更新内容
            )
            if (!result) {
                return {
                    code: 404,
                    message: '题目不存在',
                }
            }else{
                return {
                    code: 200,
                    message: '题目更新成功',
                }
            }
        }catch (error) {
            console.error('userUpdateQuestion 失败:', error);
            return {
                code: 500,
                message: '更新题目失败',
                error: error.message
            };
        }
        
    },
    userDeleteQuestion: async ({uid,questionId,bankId}) => {
        try {
            const result = await userQuestionModel.findOneAndDelete({ Uid: uid, _id: questionId,});// 查找用户的指定题库
            if (!result) {
                return {
                    code: 404,
                    message: '题目不存在',
                }
            }
            // 更新用户的题库信息，减少题目数量
            const updateResult = await ConsumerModel.updateOne(// 更新用户的指定题库
                { _id: uid, 'questionbanks._id': bankId },// 查找用户的指定题库
                { $inc: { 'questionbanks.$.questionCount': -1 } }// 减少 questionCount 字段的值
            );
            if (updateResult.modifiedCount === 0) {
                return {
                    code: 404,
                    message: '题库不存在或没有题目可删除',
                }
            }
            return {
                code: 200,
                message: '题目删除成功',
            }

        }catch (error) {
            console.error('userDeleteQuestion 失败:', error);
            return {
                code: 500,
                message: '删除题目失败',
                error: error.message
            };
        }
    },
    userDeleteBank: async ({uid,bankId}) => {
        try {
            //用户题库有题目不能执行删除
            const isDelete = await userQuestionModel.findOne({ Uid: uid, questionbankId: bankId });// 查找用户的指定题库
            if (isDelete) {
                return {
                    code: 400,
                    message: '题库存在题目不能删除',
                }
            }else{
                    const result = await ConsumerModel.updateOne(// 更新用户的指定题库  
                        { _id: uid },// 查找用户的指定题库
                        { $pull: { questionbanks: { _id: bankId } } }// 删除 questionbanks 数组中 _id 为 bankId 的元素
                    );
                    if (result.modifiedCount === 0) {
                    return {
                        code: 404,
                        message: '题库不存在',
                    }
                }
            }
            return {
                code: 200,
                message: '题库删除成功',
            }
        }catch (error) {
            console.error('userDeleteBank 失败:', error);
            return {
                code: 500,
                message: '删除题库失败',
                error: error.message
            };
        }
    },
    useraddwrongquestion: async ({uid, questionId, examId,Type}) => {
        try {
            // 检查用户是否已经存在该错题
            const existingWrongQuestion = await ConsumerModel.findOne({ 
                _id: uid, 
                'wrongQuestions.questionId': questionId, 
                'wrongQuestions.examId': examId 
            });
            if (existingWrongQuestion) {
                //更新时间
                const updateResult = await ConsumerModel.updateOne(// 更新用户的指定题库
                    { _id: uid, 
                        'wrongQuestions.questionId': questionId, 
                        'wrongQuestions.examId': examId },// 查找用户的指定题库
                    { $set: { 'wrongQuestions.$.createTime': new Date() } }// 更新 createTime 字段的值
                );  
                return {
                    code: 200,
                    message: '错题已存在',
                };
            }
            // 如果不存在，则添加
            const result = await ConsumerModel.updateOne(// 更新用户的指定题库
                { _id: uid },// 查找用户的指定题库
                { $push: 
                    { wrongQuestions: 
                        { questionId, examId,Type,createTime: new Date() } 
                    } 
                }
            );
            if (result.modifiedCount === 0) {
                return {
                    code: 404,
                    message: '用户不存在',
                }
            }
            return {
                code: 200,
                message: '错题添加成功',
            }
            
        }catch (error) {
            console.error('useraddwrongquestion 失败:', error);
            return {
                code: 500,
                message: '添加错题失败',
                error: error.message
            };
        }
        
    },
    userDeleteWrongQuestion: async ({uid, questionId}) => {
        try {
            const result = await ConsumerModel.updateOne(// 更新用户的指定题库
                { _id: uid },// 查找用户的指定题库
                { $pull: { wrongQuestions: { questionId } } }// 删除 wrongQuestions 数组中 questionId 为 questionId 的元素
            );
            if (result.modifiedCount === 0) {
                return {
                    code: 404,
                    message: '错题不存在',
                }
            }
            return {
                code: 200,
                message: '错题删除成功',
            }
        }catch (error) {
            console.error('userDeleteWrongQuestion 失败:', error);
            return {
                code: 500,
                message: '删除错题失败',
                error: error.message
            };
        }
    },
    useraddfavoritequestion: async ({uid,questionId,examId,Type}) => {
        try {
            // 检查用户是否已经存在该错题
            const existingfavoriteQuestion = await ConsumerModel.findOne({
                _id: uid,
                'favoriteQuestions.questionId': questionId,
                'favoriteQuestions.examId': examId
            });
            if (existingfavoriteQuestion) {
                return {
                    code: 200,
                    message: '收藏已存在',
                };
            }
            // 如果不存在，则添加
            const result = await ConsumerModel.updateOne(// 更新用户的指定题库
                { _id: uid },// 查找用户的指定题库
                { $push:
                    { 
                        favoriteQuestions:{ 
                            questionId, examId,Type,createTime: new Date() 
                        } 
                    }
                }
            );
            if (result.modifiedCount === 0) {
                return {
                    code: 404,
                    message: '用户不存在',
                }
            }
            return {
                code: 200,
                message: '收藏添加成功',
            }
        }catch (error) {
            console.error('useraddfavoritequestion 失败:', error);
            return {
                code: 500,
                message: '添加收藏失败',
                error: error.message
            };
        }
    },
    userDeleteFavoriteQuestion: async ({uid, questionId}) => {
        try {
            const result = await ConsumerModel.updateOne(// 更新用户的指定题库
                { _id: uid },// 查找用户的指定题库
                { $pull: { favoriteQuestions: { questionId } } }// 删除 favoriteQuestions 数组中 questionId 为 questionId 的元素
            );  
            if (result.modifiedCount === 0) {
                return {
                    code: 404,
                    message: '收藏不存在',
                }
            }
            return {
                code: 200,
                message: '收藏删除成功',
            }
        }catch(error) {
            console.error('userDeleteFavoriteQuestion 失败:', error);
            return {
                code: 500,
                message: '删除收藏失败',
                error: error.message
            };
        }
    }
      
}
module.exports = ExamService