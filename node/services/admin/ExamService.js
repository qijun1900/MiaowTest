const ExamModel = require('../../models/ExamModel')
const ExamSelectModel = require('../../models/SelectModel')
const ExamBlankModel = require('../../models/BlankModel')
const ExamJudgeModel = require('../../models/JudgeModel')
const ExamShortModel = require('../../models/ShortModel')
const UserExamModel = require('../../models/UserExamModel')
const AianalysisModel = require('../../models/AianalysisModel')
const {deleteFile} = require('../../helpers/ossHelper');

const ExamService = {
    ExamAdd: async ({
        name,
        category,
        code,
        year,
        isPublish,
        cover,
        creator,
        day,
        createdTime
    }) => {
        return ExamModel.create({
            name,
            code,
            category,
            year,
            isPublish,
            cover,
            creator,
            day,
            createdTime
        })
    },
    getexamList: async ({ page, size }) => {
        //分页查询
        const skip = (page - 1) * size
        const [data, total] = await Promise.all([
            ExamModel.find({})
                .skip(skip)
                .limit(size)
                .sort({ createdTime: -1 }),
            ExamModel.countDocuments({})
        ])
        return { data, total };
    },
    updateInfo: async ({ name, code, category, year, isPublish, cover, creator, day, createdTime, _id }) => {
        if (cover) {
            // 删除旧封面文件
            const exam = await ExamModel.findById(_id);
            if (exam && exam.cover) {
                await deleteFile(exam.cover);
            }
            return ExamModel.updateOne({ _id }, {
                name,
                code,
                category,
                year,
                isPublish,
                createdTime,
                cover,
                creator,
                day
            })
        } else {
            return ExamModel.updateOne({ _id }, {
                name,
                code,
                category,
                year,
                isPublish,
                createdTime
            })
        }
    },
    updateExamStatus: async ({ _id, state }) => {
        return ExamModel.updateOne({ _id }, { isPublish: state })
    },
    deleteOneExamInfo: async ({ _id }) => {
        return ExamModel.deleteOne({ _id })
    },
    deleteManyExamInfo: async ({ _ids }) => {
        return ExamModel.deleteMany({ _id: { $in: _ids } })
    },
    AddSelectQuestion: async ({ examId, stem, options, isPublish, analysis, isAIanswer, isAddUserList, createdTime, Type, isMultiple }) => {
        return ExamSelectModel.create({
            examId,
            stem,
            options,
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            isMultiple,
            createdTime
        })
    },
    getSelectQuestionList: async ({ page, size, examId, questionType }) => {
        const skip = (page - 1) * size;
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        const model = modelMap[questionType];
        const [data, total] = await Promise.all([
            model.find({ examId })
                .skip(skip)
                .limit(size),
            model.countDocuments({ examId })
        ]);
        return { data, total };
    },
    AddBlankQuestion: async ({ examId, stem, options, isPublish, analysis, isAIanswer, isAddUserList, createdTime, Type }) => {
        return ExamBlankModel.create({
            examId,
            stem,
            options,
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            createdTime
        })
    },
    AddJudgeQuestion: async ({ examId, stem, answer, isPublish, analysis, isAIanswer, isAddUserList, createdTime, Type }) => {
        return ExamJudgeModel.create({
            examId,
            stem,
            answer,
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            createdTime
        })
    },
    AddShortQuestionList: async ({ examId, stem, content, isPublish, analysis, isAIanswer, isAddUserList, createdTime, Type }) => {
        return ExamShortModel.create({
            examId,
            stem,
            content,
            isPublish,
            analysis,
            isAIanswer,
            isAddUserList,
            Type,
            createdTime
        })
    },
    UpdateOneQuestion: async ({ _id, isPublish, questionType }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.updateOne({ _id }, { isPublish }) || null;
    },
    UpdateBatchQuestion: async ({ Ids, questionType }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.updateMany(
            { _id: { $in: Ids } },
            { $bit: { isPublish: { xor: 1 } } }  // 使用位运算翻转布尔值
        ) || null;
    },
    DeleteOneQuestion: async ({ _id, questionType }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.deleteOne({ _id }) || null;
    },
    DeleteManyQuestion: async ({ Ids, questionType }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.deleteMany({ _id: { $in: Ids } }) || null;
    },
    getQuestionInfo: async ({ _id, questionType }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.find({ _id }) || null;
    },
    UpdateSelectQuestion: async ({ _id, stem, options, isPublish, analysis, isAIanswer, isMultiple, createdTime }) => {
        // 等待更新操作完成
        const updateResult = await ExamSelectModel.updateOne({ _id }, {
            stem,
            options,
            isPublish,
            analysis,
            isAIanswer,
            isMultiple,
            createdTime
        });

        // 执行删除操作
        const deleteAIResult = await AianalysisModel.deleteMany({ questionId: _id });

        // 返回更新和删除操作的结果
        return {
            updateResult,
            deleteAIResult
        };

    },
    UpdateBlankQuestion: async ({ _id, stem, options, isPublish, analysis, isAIanswer, createdTime }) => {
        const updateResult = await ExamBlankModel.updateOne({ _id }, {
            stem,
            options,
            isPublish,
            analysis,
            isAIanswer,
            createdTime
        });

        // 执行删除操作
        const deleteAIResult = await AianalysisModel.deleteMany({ questionId: _id });

        // 返回更新和删除操作的结果
        return {
            updateResult,
            deleteAIResult
        };
    },
    UpdateJudgeQuestion: async ({ _id, stem, answer, isPublish, analysis, isAIanswer, createdTime }) => {

        const updateResult = await ExamJudgeModel.updateOne({ _id }, {
            stem,
            answer,
            isPublish,
            analysis,
            isAIanswer,
            createdTime
        })
        // 执行删除操作
        const deleteAIResult = await AianalysisModel.deleteMany({ questionId: _id });

        // 返回更新和删除操作的结果
        return {
            updateResult,
            deleteAIResult
        };
    },
    UpdateShortQuestionList: async ({ _id, stem, content, isPublish, analysis, isAIanswer, createdTime }) => {

        const updateResult = await ExamShortModel.updateOne({ _id }, {
            stem,
            content,
            isPublish,
            analysis,
            isAIanswer,
            createdTime
        })
        // 执行删除操作
        const deleteAIResult = await AianalysisModel.deleteMany({ questionId: _id });
        // 返回更新和删除操作的结果
        return {
            updateResult,
            deleteAIResult
        };
    },
    UpdateExamStatus: async ({ examId, isPublish }) => {
        const [examUpdate, userExamUpdate] = await Promise.all([
            ExamModel.updateOne({ _id: examId }, { isPublish }),
            UserExamModel.updateOne({ examId }, { isPublish })
        ]);
        return {
            matchedCount: examUpdate.matchedCount + userExamUpdate.matchedCount,
            modifiedCount: examUpdate.modifiedCount + userExamUpdate.modifiedCount
        }
    },
    UpdateExamAuthStatus: async ({ examId, state }) => {
        return ExamModel.updateOne({ _id: examId }, { isAuthRequired: state })
    },
    AddquestionTitle: async ({ content, description, isPublish, questionIdS, examId }) => {
        return  UserExamModel.updateOne(
            { examId }, // 匹配 examId 字段
            {
                $push:
                {
                    questionTitle:
                    {
                        content,
                        description,
                        isPublish,
                        questionIdS
                    }
                }
            }, // 追加新的 questionTitle 数组元素
            { upsert: true } // 如果不存在匹配的文档，则创建一个新文档
        )
    },
    getQuestionTitle: async ({ page, size, examId }) => {
        const skip = (page - 1) * size;
        return UserExamModel.aggregate([
            { $match: { examId } },//匹配examId
            {
                $facet: {//返回两个字段，data和total
                    data: [// 数据
                        { $unwind: "$questionTitle" },//解包questionTitle数组
                        {
                            $project: {// 选择需要的字段
                                content: "$questionTitle.content",
                                description: "$questionTitle.description",
                                _id: "$questionTitle._id",
                                isPublish: "$questionTitle.isPublish",
                                questionIdS: "$questionTitle.questionIdS"
                            }
                        },
                        { $skip: skip },// 跳过前面的数据
                        { $limit: size }// 限制返回的数量
                    ],
                    total: [// 计算总数
                        { $unwind: "$questionTitle" },
                        { $count: "total" }
                    ]
                }
            },
            {
                $project: {
                    data: 1,
                    total: { $arrayElemAt: ["$total.total", 0] }
                }
            }
        ]);

    },
    UpdateQuestionTitle: async ({content,description,examId,_id }) => {
        return UserExamModel.updateOne(
            { examId, "questionTitle._id": _id },//匹配examId和questionTitle._id
            { 
                $set: { 
                    "questionTitle.$.content": content, 
                    "questionTitle.$.description": description 
                } 
            }
        )
    },
    CheckQuestionTitle: async ({ examId, _id }) => {
        const userExam = await UserExamModel.findOne(
            { examId, "questionTitle._id": _id },//匹配examId和questionTitle._id
            { "questionTitle.$": 1 } // 只返回匹配的questionTitle元素
        )
        
        // 检查是否存在匹配的文档以及questionIdS数组长度是否大于0
        if (userExam && userExam.questionTitle && userExam.questionTitle.length > 0) {
            const hasQuestion = userExam.questionTitle[0].questionIdS && userExam.questionTitle[0].questionIdS.length > 0;
            return { hasQuestion };
        }
        
        return { hasQuestion: false };
    },
    DeleteOneQuestionTitle: async ({ examId, _id }) => {
        return UserExamModel.updateOne(
            { examId },//匹配examId
            { $pull: { questionTitle: { _id } } }//删除questionTitle数组中_id匹配的元素
        )
    },
    DeleteManyQuestionTitle: async ({ examId, _ids }) => {
        return UserExamModel.updateOne(
            { examId },//匹配examId
            { $pull: { questionTitle: { _id: { $in: _ids } } } }//删除questionTitle数组中_id匹配的元素
        )
    },
    UpdateOneQuestionTitleState: async ({ _id, examId, isPublish}) => {
        return UserExamModel.updateOne(
            { examId, "questionTitle._id": _id },//匹配examId和questionTitle._id
            { $set: { "questionTitle.$.isPublish": isPublish } }
        )
    },
    getAddQusetionList: async ({category ,examId}) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        const model = modelMap[category];
        return model.find({ examId: examId,isAddUserList:0,isPublish:1},{_id:1,stem:1,isAddUserList:1}) || null;
    },
    AddOneQuestion: async ({_id,examId, category,QuestionTitleId}) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        const model = modelMap[category];
        const [updateResult, insertResult] = await Promise.all([
            model.updateOne(
                { _id },
                { $set: { isAddUserList: 1 } }
            ),
            UserExamModel.updateOne(
                { examId, "questionTitle._id": QuestionTitleId },
                { $push: { "questionTitle.$.questionIdS": { _id ,category} } }
            )
        ])
        return {
            updateResult,
            insertResult
        }
    },
    AddManyQuestion: async ({_ids,examId,category,QuestionTitleId}) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        const model = modelMap[category];   
        const [updateResult, insertResult] = await Promise.all([
            model.updateMany(
                { _id: { $in: _ids } },
                { $set: { isAddUserList: 1 } }
            ),
            UserExamModel.updateOne(
                { examId, "questionTitle._id": QuestionTitleId },
                { $push: { "questionTitle.$.questionIdS": { $each: _ids.map(_id => ({ _id,category })) } } }
            )
            
        ])
        return {
            updateResult,
            insertResult
        }
    },
    getCheckQusetionList: async ({examId,QuestionTitleId}) => {
        const userExamInfo= await UserExamModel.findOne(
            {
                examId,
                "questionTitle._id": QuestionTitleId
            },
            {
                "questionTitle.$": 1// 使用$投影操作符只返回匹配的questionTitle数组元素
                // 1表示包含该字段，0表示排除其他字段
            }
        )
        // 返回匹配的questionTitle条目中的questionIdS数组，如果没有则返回空数组
        return userExamInfo.questionTitle[0].questionIdS || [];
       
    },
    MatchQusetionList: async ({extractedData}) => {
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
    RemoveUserQuestionList: async ({chooseInfo,examId,QuestionTitleId}) => {
        // 删除该题型下的题目ids,并将isAddUserList置为0
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        }
        const updatePromises = chooseInfo.map(({ _id, category }) => {// 更新题目状态
            const model = modelMap[category];
            return model.updateOne({ _id }, { isAddUserList: 0 });
        });
        const deletePromises = chooseInfo.map(({ _id }) => {// 删除题目ID
            return UserExamModel.updateOne(
                { examId, "questionTitle._id": QuestionTitleId },
                { $pull: { "questionTitle.$.questionIdS": { _id } } }
            );
        })
        const [updateResults, deleteResults] = await Promise.all([
            Promise.all(updatePromises),
            Promise.all(deletePromises)
        ])
        return {
            updateResults,
            deleteResults
        }
    },
    batchPublishedUserQuestionsList: async ({ examId, Type, titleId, questionId, questionIdS }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        }
        const [updateResult, insertResult] = await Promise.all([
            modelMap[Type]?.updateMany(
                { examId, _id: { $in: questionId } },
                { $set: { isAddUserList: 1 } }
            ) || null,
            UserExamModel.updateOne(
                { examId, "questionTitle._id": titleId },
                { $push: { "questionTitle.$.questionIdS": { $each: questionIdS } } }
            )
        ])
        return {
            updateResult,
            insertResult
        }
    },
    getUserQuestionsList: async ({ examId, titleId }) => {
        // 1. 查询匹配的考试文档并投影出对应的questionTitle条目
        const userExamInfo = await UserExamModel.findOne(
            {
                examId,  // 根据考试ID筛选
                "questionTitle._id": titleId  // 同时筛选questionTitle数组中_id匹配的条目
            },
            {
                "questionTitle.$": 1  // 使用$投影操作符只返回匹配的questionTitle数组元素
                // 1表示包含该字段，0表示排除其他字段
            }
        );
        // 返回匹配的questionTitle条目中的questionIdS数组，如果没有则返回空数组
        // questionTitle[0]是因为$投影操作符确保只返回一个匹配的数组元素
        return userExamInfo.questionTitle[0].questionIdS || [];
    },

    UserquestionlistDown: async ({ examId, questionType, isAddUserList }) => {
        const modelMap = {
            1: ExamSelectModel,
            2: ExamBlankModel,
            3: ExamJudgeModel,
            4: ExamShortModel
        };
        return modelMap[questionType]?.updateMany({ examId, isAddUserList }, { isAddUserList: 0 }) || null;
    },
    AddNetDisk: async ({ title,type,url,description,isPublish,examId}) => {
       try {
        return await UserExamModel.updateOne(
            { examId }, //检查是否有存在 examId 的考试
            { $push: { 
                netDiskTitle: 
                    { 
                        title,description,isPublish,createTime:new Date(),
                        content:[{type,url}] 
                    } 
                } 
            },
            { upsert: true } // 如果不存在匹配的文档，则创建一个新文档
        )
       }catch(error){
        console.error("添加网盘链接资料失败",error);
        throw error;
       }  
    },
    getNetDiskList: async ({ page, size, examId }) => {
        try{
            const skip = (page - 1) * size;
            return await UserExamModel.aggregate([
            { $match: { examId } },//匹配examId
            {
                $facet: {//返回两个字段，data和total
                    data: [// 数据
                        { $unwind: "$netDiskTitle" },//解包netDiskTitle数组
                        {
                            $project: {// 选择需要的字段
                                title: "$netDiskTitle.title",
                                description: "$netDiskTitle.description",
                                _id: "$netDiskTitle._id",
                                isPublish: "$netDiskTitle.isPublish",
                                content: "$netDiskTitle.content",
                                createTime: "$netDiskTitle.createTime"
                            }   
                        },
                        { $skip: skip },// 跳过前面的数据
                        { $limit: size }// 限制返回的数量
                    ],
                    total: [// 计算总数
                        { $unwind: "$netDiskTitle" },
                        { $count: "total" }
                    ]
                }

            }
        ])
        }catch(error){
            console.error("获取网盘资料列表失败",error);
            throw error;
        }
    },
    UpdateNetDisk: async ({ _id, title,type,url,description,isPublish,examId }) => {
        try{
            return await UserExamModel.updateOne(
                { examId, "netDiskTitle._id": _id },//匹配examId和netDiskTitle._id
                { $set: 
                    { "netDiskTitle.$.title": title,
                        "netDiskTitle.$.description": description,
                        "netDiskTitle.$.isPublish": isPublish,
                        "netDiskTitle.$.content": [{type,url}]
                    } 
                }
            )
        }catch(error){
            console.error("更新网盘资料信息失败",error);
            throw error;
        }
    },
    UpdateNetDiskState: async ({ _id, state, examId }) => {
        try{
            return await UserExamModel.updateOne(
                { examId, "netDiskTitle._id": _id },//匹配examId和netDiskTitle._id
                { $set: { "netDiskTitle.$.isPublish": state } }
            )
        }catch(error){
            console.error("更新网盘资料状态失败",error);
            throw error;
        }
    },
    DeleteOneNetDisk: async ({ _id, examId }) => {
        try{
            return await UserExamModel.updateOne(
                { examId },//匹配examId
                { $pull: { netDiskTitle: { _id } } }//删除netDiskTitle数组中_id匹配的元素
            )
        }catch(error){
            console.error("删除单个网盘资料信息失败",error);
        }
    }
}
module.exports = ExamService