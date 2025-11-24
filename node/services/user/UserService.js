const wxAuth = require("../../MiddleWares/wxAuth");
const JWT = require("../../MiddleWares/jwt");
const ConsumerModel = require("../../models/ConsumerModel");
const ExamModel = require("../../models/ExamModel");
const FeedbackModel = require("../../models/ConsumerFeedbackModel");
const QuestionNoteModel = require("../../models/QuestionNoteModel");
const { getNextUserCount } = require("../../models/CounterModel"); // 引入计数器模型和函数
const mongoose = require('mongoose');
const chat  = require("../../llm/admin/Chat/chat");
const UserQuestionModel = require("../../models/UserQuestionModel");


const UserService = {
    Userlogin: async (message, code) => {
        try {
            const { openid, session_key } = await wxAuth.wxAuth(code);

            // 查找或创建用户
            let user = await ConsumerModel.findOne({ openid });

            if (!user) {
                // 为新用户生成注册顺序号
                const userCount = await getNextUserCount();
                
                // 创建新用户
                user = new ConsumerModel({
                    openid,
                    session_key,
                    createTime: new Date(),
                    userCount: userCount, // 设置用户注册顺序号
                });
                await user.save();

                console.log('创建新微信用户:', openid, '注册顺序号:', userCount);
            }

            // 生成token，包含openid和过期时间（例如7天），如果过期将生成新的token
            const token = JWT.generate({ uid: user._id}, '7d');
            
            // 确保用户有注册顺序号（兼容性处理）
            if (!user.userCount) {
                // 为老用户分配注册顺序号
                const userCount = await getNextUserCount();
                user.userCount = userCount;
                await user.save();
                console.log('为老用户分配注册顺序号:', user._id, userCount);
            }
            
            return {
                success: true,
                data: {
                    token,
                    userInfo: {
                        uid: user._id,
                        openid: user.openid,
                        nickname: user.nickname || '',
                        avatar: user.avatar || '',
                        gender: user.gender || 0,
                        username: user.username || '',
                        userCount: user.userCount,
                    }
                }
            };

        } catch (error) {
            console.error("Userlogin 失败", error);
            return {
                code: 500,
                message: '登录失败',
                error: error.message
            };
        }
    },
    UserRegister: async (account, verifyCode, password) => {
        try {
            // 检查验证码是否正确（这里需要实现验证码验证逻辑）
            // 假设验证码验证通过，直接注册用户
            console.log(account, verifyCode, password);

            // 为新用户生成注册顺序号
            const userCount = await getNextUserCount();

            const newUser = new ConsumerModel({ 
                username: account,
                email: account, 
                password,
                createTime: new Date(),
                userCount: userCount, // 设置用户注册顺序号
            });

            await newUser.save();

            return {
                code: 200,
                success: true,
                message: '注册成功',
                data: {
                    userCount: userCount // 返回注册顺序号
                }
            }
        }catch (error) {
            console.error("UserRegister 失败", error);
            throw error;
        }
    },
    UserAccountLogin: async (account, password) => {
        try {
            // 查找用户，可以通过用户名或邮箱登录
            const user = await ConsumerModel.findOne({ 
                $or: [
                    { username: account },
                    { email: account }
                ]
            });

            // 如果用户不存在
            if (!user) {
                return {
                    code: 404,
                    success: false,
                    message: '账号尚未注册'
                };
            }
            // 检查密码是否匹配（这里假设密码是明文存储，实际应用中应使用哈希存储）
            if (user.password !== password) {
                return {
                    code: 401,
                    success: false,
                    message: '密码或账号错误'
                };
            }

            // 确保用户有注册顺序号（兼容性处理）
            if (!user.userCount) {
                // 为老用户分配注册顺序号
                const userCount = await getNextUserCount();
                user.userCount = userCount;
                await user.save();
                console.log('为老用户分配注册顺序号:', user._id, userCount);
            }

            // 生成token，包含用户ID和过期时间（7天）
            const token = JWT.generate({ uid: user._id }, '7d');
            
            return {
                code: 200,
                success: true,
                message: '登录成功',
                data: {
                    token,
                    userInfo: {
                        uid: user._id,
                        nickname: user.nickname || '',
                        avatar: user.avatar || '',
                        gender: user.gender || 0,
                        username: user.username || '',
                        userCount: user.userCount,
                    }
                }
            };
        } catch (error) {
            console.error("UserAccountLogin 失败", error);
            return {
                code: 500,
                success: false,
                message: '登录失败',
                error: error.message
            };
        }
    },
    // 更新用户信息
    updateUserInfo: async ({ uid, nickname, avatar, gender }) => {
        try {
            const user = await ConsumerModel.findOne({ _id:uid });

            if (!user) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                };
            }

            // 更新用户信息
            if (nickname !== undefined) {
                user.nickname = nickname;
            }

            if (gender !== undefined) {
                user.gender = gender;
            }

            if (avatar !== undefined) {
                user.avatar = avatar;
            }

            await user.save();// 保存更新

            return {
                code: 200,
                message: '更新成功',
                success: true,
                data: {
                    uid: user._id,
                    openid: user.openid,
                    nickname: user.nickname || '',
                    avatar: user.avatar || '',
                    gender: user.gender || 0,
                }
            };
        } catch (error) {
            console.error("updateUserInfo 失败", error);
            return {
                code: 500,
                message: '更新失败',
                error: error.message
            };
        }
    },
    addExamFavorite: async (examId, uid) => {
        try {
            const result = await ConsumerModel.findOneAndUpdate(
                { _id: uid }, // 查询条件
                { $addToSet: { favoriteExams: examId } }, // 更新操作，将examId添加到favoriteExams数组中，确保不重复
                { new: true } // 返回更新后的文档
            );

            if (!result) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                };
            }

            return {
                code: 200,
                message: '收藏成功',
                success: true,
            };
        } catch (error) {
            console.error("addExamFavorite 失败", error);
            return {
                code: 500,
                message: '收藏失败',
                error: error.message,
                success: false
            };
        }
    },
    getExamFavorites: async (examId, uid) => {
        try {
            const user = await ConsumerModel.findOne({ _id:uid });

            if (!user) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                };
            }

            // 检查用户是否收藏了该考试
            const isFavorited = user.favoriteExams && user.favoriteExams.includes(examId);

            return {
                code: 200,
                success: true,
                data: {
                    isFavorited: isFavorited
                }
            };
        } catch (error) {
            console.error("getExamFavorites 失败", error);
            return {
                code: 500,
                error: error.message,
                success: false
            };
        }
    },
    removeExamFavorite: async (examId, uid) => {
        try {
            const result = await ConsumerModel.findOneAndUpdate(
                { _id: uid }, // 查询条件
                { $pull: { favoriteExams: examId } }, // 更新操作，将examId从favoriteExams数组中移除
                { new: true } // 返回更新后的文档
            );  

            if (!result) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                }
            }
            return {
                code: 200,
                message: '取消收藏成功',
                success: true,
            }
        }catch (error) {
            console.error("removeExamFavorite 失败", error);
            return {
                code: 500,
                message: '取消收藏失败',
                error: error.message,
                success: false
            }
        }
    },
    getUserFavoritesExam: async (uid) => {
        try {
            const user = await ConsumerModel.findOne({ _id:uid });

            if (!user) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                }
            }
            // 查询收藏的考试信息，只返回指定字段
            const result = await ExamModel.find({
                _id: { $in: user.favoriteExams }// 通过用户收藏的考试ID，查询对应的考试信息
            }).select('name code  year cover  day createdTime _id');
            
            return {
                code: 200,
                success: true,
                data: result
            }
        }catch (error) {
            console.error("getUserFavoritesExam 失败", error);
            return {
                code: 500,
                error: error.message,
                success: false
            }
        }
    },
    BindAccount: async ({uid, account, password, verifyCode}) => {
        try {
            // 首先检查微信用户是否存在
            const wechatUser = await ConsumerModel.findOne({ _id: uid });
            
            if (!wechatUser) {
                return {
                    code: 404,
                    message: '微信用户不存在',
                    success: false
                };
            }
            
            // 检查账号是否已被其他用户绑定
            const existingUser = await ConsumerModel.findOne({ 
                $or: [
                    { username: account },
                    { email: account }
                ]
            });
            
            if (existingUser) {
                // 如果是同一个用户，直接更新信息，即换绑账号
                if (existingUser._id.toString() === uid) {
                    wechatUser.username = account;
                    wechatUser.email = account;
                    wechatUser.password = password;
                    await wechatUser.save()
                    return {
                        code: 200,
                        message: '账号绑定成功',
                        success: true,
                    };
                }
                
                // 如果是不同用户，需要将非微信用户的数据转移到微信用户，然后删除非微信用户，并绑定账号和密码
                //  转移收藏的考试
                if (existingUser.favoriteExams && existingUser.favoriteExams.length > 0) {
                    // 合并收藏的考试，去重
                    const mergedFavorites = [...new Set([
                        ...(wechatUser.favoriteExams || []),
                        ...existingUser.favoriteExams
                    ])];
                    wechatUser.favoriteExams = mergedFavorites;
                }
                
                
                // 删除非微信用户
                await ConsumerModel.deleteOne({ _id: existingUser._id });
            }
            
            // 更新微信用户信息，绑定账号和密码
            wechatUser.username = account;
            wechatUser.email = account; // 将账号同时作为邮箱
            wechatUser.password = password;
            
            await wechatUser.save();
            
            return {
                code: 200,
                message: '账号绑定成功',
                success: true,
            };
        } catch (error) {
            console.error("BindAccount 失败", error);
            return {
                code: 500,
                message: '绑定失败',
                error: error.message,
                success: false
            }
        }
    },
    checkUserBind: async (uid) => {
        try {
            //检查用户是否绑定账号
            const user = await ConsumerModel.findOne({ _id:uid });  
            if (!user) {
                return {
                    code: 404,
                    message: '用户不存在',
                    success: false
                }
            }
            const isBind = user.username && user.password;
            return {
                code: 200,
                success: true,
                data: {
                    isBind: !!isBind,
                }
            }
        }
        catch (error) {
            console.error("checkUserBind 失败", error);
            return {
                code: 500,
                message: '服务器错误',
                error: error.message,
                success: false
            }
        }
    },
    userFeedback: async ({
        uid,
        type,
        content,
        contactInfo,
        relatedId
    }) => {
        try {
            // 创建新的反馈记录
            const newFeedback = new FeedbackModel({
                uid, // 用户ID，可选，如果未登录则为null
                type, // 反馈类型，例如问题、建议
                content, // 反馈内容
                contactInfo, // 联系方式（可选）
                relatedId, // 相关ID（例如问题ID、考试ID等），可选
                createTime: new Date(), // 创建时间
            })
            await newFeedback.save();// 保存到数据库
            return {
                code: 200,
                message: '反馈提交成功',
                success: true,
            };
        } catch (error) {
            console.error("userFeedback 失败", error);
            return {
                code: 500,
                success: false
            }
        }

    },
    // 保存练习笔记
    savePracticeNote: async ({
        uid,
        questionId,
        questionType,
        examId,
        content,
        tags = [],// 标签数组，默认为空数组
        isPublic = false // 是否公开，默认为false
    }) => {
        try {
            // 检查是否已存在该用户对该题目的笔记
            const existingNote = await QuestionNoteModel.findOne({
                Uid: uid,
                questionId: questionId
            });

            if (existingNote) {
                // 更新现有笔记
                existingNote.content = content;
                existingNote.questionType = questionType;
                existingNote.examId = examId;
                existingNote.tags = tags;
                existingNote.isPublic = isPublic;
                existingNote.updateTime = new Date();
                
                await existingNote.save();
                
                return {
                    code: 200,
                    message: '笔记更新成功',
                    success: true,
                };
            } else {
                // 创建新笔记
                const newNote = new QuestionNoteModel({
                    Uid: uid,
                    questionId: questionId,
                    questionType: questionType,
                    examId: examId,
                    content: content,
                    tags: tags,
                    isPublic: isPublic,
                    updateTime: new Date()
                });

                await newNote.save();

                return {
                    code: 200,
                    message: '笔记保存成功',
                    success: true,
                };
            }
        } catch (error) {
            console.error("savePracticeNote 失败", error);
            return {
                code: 500,
                message: '笔记保存失败',
                error: error.message,
                success: false
            };
        }
    },
    // 获取用户特定题目的笔记
    getPracticeNote: async ({ uid, questionId }) => {
        try {
            // 查找用户对特定题目的笔记
            const note = await QuestionNoteModel.findOne({
                Uid: uid,
                questionId: questionId
            });

            if (note) {
                return {
                    code: 200,
                    success: true,
                    data: {
                        hasNote: true,
                        note: {
                            content: note.content,
                            updateTime: note.updateTime,
                        }
                    }
                };
            } else {
                return {
                    code: 200,
                    success: true,
                    data: {
                        hasNote: false,
                        note: null,
                    }
                };
            }
        } catch (error) {
            console.error("getPracticeNote 失败", error);
            return {
                code: 500,
                message: '获取笔记失败',
                error: error.message,
                success: false
            };
        }
    },
    // 获取用户笔记的考试列表
    getNoteExamList: async ({ uid }) => {
        try {
            // 使用聚合查询获取用户所有笔记关联的考试信息
            const examList = await QuestionNoteModel.aggregate([
                // 第一步：匹配用户ID
                { $match: { Uid: new mongoose.Types.ObjectId(uid) } },
                
                // 第二步：按examId分组，获取每个考试的最新笔记时间和笔记数量
                {
                    $group: {
                        _id: "$examId",
                        latestNoteTime: { $max: "$updateTime" },
                        noteCount: { $sum: 1 }
                    }
                },
                
                // 第三步：关联考试表获取考试详情
                {
                    $lookup: {
                        from: "exams",
                        localField: "_id",
                        foreignField: "_id",
                        as: "examInfo"
                    }
                },
                
                // 第四步：处理关联结果
                {
                    $unwind: "$examInfo"
                },
                
                // 第五步：整理输出格式
                {
                    $project: {
                        _id: "$examInfo._id",
                        name: "$examInfo.name",
                        cover: "$examInfo.cover",
                        noteCount: 1// 包含笔记数量
                    }
                },
                
                // 第六步：按最新笔记时间降序排序
                { $sort: { latestNoteTime: -1 } }
            ]);

            return {
                code: 200,
                success: true,
                data: examList
            };
        } catch (error) {
            console.error("getNoteExamList 失败", error);
            return {
                code: 500,
                message: '获取笔记考试列表失败',
                error: error.message,
                success: false
            };
        }
    },
    // 根据考试ID和用户ID获取带笔记的题目列表
    getNoteListByExamId: async ({ uid, examId }) => {
        try {
            // 引入各种题目模型
            const SelectModel = require("../../models/SelectModel");
            const JudgeModel = require("../../models/JudgeModel");
            const BlankModel = require("../../models/BlankModel");
            const ShortModel = require("../../models/ShortModel");
            
            // 1. 查询用户在该考试下的所有笔记
            const notes = await QuestionNoteModel.find({
                Uid: uid,
                examId: examId
            }).sort({ updateTime: -1 });

            if (notes.length === 0) {
                return {
                    code: 200,
                    success: true,
                    message: '该考试下暂无笔记',
                    data: []
                };
            }

            // 2. 根据笔记中的题目ID和题目类型，查询对应的题目信息
            const questionsWithNotes = [];

            for (const note of notes) {
                let question = null;
                
                // 根据题目类型查询对应的题目
                switch (note.questionType) {
                    case 1: // 选择题
                        question = await SelectModel.findById(note.questionId);
                        break;
                    case 2: // 填空题
                        question = await BlankModel.findById(note.questionId);
                        break;
                    case 3: // 判断题
                        question = await JudgeModel.findById(note.questionId);
                        break;
                    case 4: // 简答题
                        question = await ShortModel.findById(note.questionId);
                        break;
                }

                // 如果找到题目，则将题目信息和笔记合并
                if (question) {
                    questionsWithNotes.push({
                        questionId: question._id,
                        questionType: note.questionType,
                        stem: question.stem,
                        options: question.options || null,
                        answer: question.answer || null,
                        analysis: question.analysis || '',
                        content: question.content || '',
                        note: {
                            content: note.content,
                            updateTime: note.updateTime
                        }
                    });
                }
            }
            return {
                code: 200,
                success: true,
                data: questionsWithNotes
            };
        } catch (error) {
            console.error("getNoteListByExamId 失败", error);
            return {
                code: 500,
                message: '获取笔记列表失败',
                error: error.message,
                success: false
            };
        }
    },
    saveUserBankPracticeNote: async ({ 
        uid, 
        questionId, 
        questionType, 
        examId, 
        content, }) => {
        try {
            // 检查是否已存在题目笔记
            const existingNote = await UserQuestionModel.findOne({
                Uid: uid,
                _id: questionId,
            });
            if (existingNote) {
                // 更新笔记内容和时间
                existingNote.note_content = {
                    content: content,
                    saveTime: new Date()
                };
                await existingNote.save();
            }
            return {
                code: 200,
                message: '保存笔记成功',
                success: true,
            }
        }catch (error) {
            console.error("saveUserBankPracticeNote 失败", error);
            return {
                code: 500,
                message: '保存笔记失败',
                error: error.message,
                success: false
            }
        }
    },
    getUserBankPracticeNote: async ({ uid, questionId }) => {
        try {
            // 查找用户对特定题目的笔记
            const note = await UserQuestionModel.findOne({
                Uid: uid,
                _id: questionId,
            });
            if (note && note.note_content) {
                return {
                    code: 200,
                    success: true,
                    data: {
                        hasNote: true,
                        note: {
                            content: note.note_content.content,
                            updateTime: note.note_content.saveTime,
                        }
                    }
                }
            }else {
                return {
                    code: 200,
                    success: true,
                    data: {
                        hasNote: false,
                        note: null,
                    }
                }
            }
        }catch (error) {
            console.error("getUserBankPracticeNote 失败", error);
        }
    },
    useLLMChat: async ({ message, model }) => {
        try {
            // 调用 chatAPI 函数，传入 message 和 model 参数
          return await chat.postUserSingleChat(message, model);
            
        }catch (error) {
            console.error("useLLMChat 失败", error);
            return {
                code: 500,
                message: '调用失败',
                error: error.message,
                success: false
            }
        }
        
    },
    //设置今日待办事项
    setTodayTodos: async ({ uid, fulldate, todos_content }) => {
        try {
            const UserTodosModel = require("../../models/UserTodosModel");
            
            // 查找是否已存在该日期的待办事项
            const existingTodos = await UserTodosModel.findOne({
                Uid: uid,
                fulldate: fulldate
            });

            if (existingTodos) {
                //如果存在 ,继续插入 todos_content
                existingTodos.todos_content.push(todos_content);
                await existingTodos.save();
                
                return {
                    code: 200,
                    message: '创建成功',
                    success: true,
                };
            } else {
                // 创建新的待办事项
                const newTodos = new UserTodosModel({
                    Uid: uid,
                    fulldate: fulldate,
                    todos_content: todos_content
                });
                
                await newTodos.save();
                
                return {
                    code: 200,
                    message: '创建成功',
                    success: true,
                };
            }
        } catch (error) {
            console.error("setTodayTodos 失败", error);
            return {
                code: 500,
                message: '待办事项保存失败',
                error: error.message,
                success: false
            };
        }
    },
    getDotDates: async ({ uid }) => {
        try {
            const UserTodosModel = require("../../models/UserTodosModel");
            // 查找用户的所有待办事项
            const todosList = await UserTodosModel.find({ Uid: uid });
            // 提取所有的日期
            const dates = todosList.map(todo => todo.fulldate);
            // 按日期排序
            const DotDates = dates.sort();
            return {
                code: 200,
                success: true,
                data: DotDates,
            };
        }catch (error) {
            console.error("getDotDates 失败", error);
            return {
                code: 500,
                message: '获取待办事项失败',
                error: error.message,
                success: false
            };
        }
    },
    getTodayTodos: async ({ uid, fulldate }) => {
        try {
            const UserTodosModel = require("../../models/UserTodosModel");
            
            const todos = await UserTodosModel.findOne({
                Uid: uid,
                fulldate: fulldate
            });

            if (todos) {
                return {
                    code: 200,
                    success: true,
                    data: todos.todos_content,// 直接返回 todos_content 数组
                };
            } else {
                return {
                    code: 200,
                    success: true,
                    data: [],
                    message: '该日期暂无待办事项'
                };
            }
        } catch (error) {
            console.error("getTodayTodos 失败", error);
            return {
                code: 500,
                message: '获取待办事项失败',
                error: error.message,
                success: false
            };
        }
    },
}


module.exports = UserService