const wxAuth = require("../../MiddleWares/wxAuth");
const JWT = require("../../MiddleWares/jwt");
const ConsumerModel = require("../../models/ConsumerModel");
const ExamModel = require("../../models/ExamModel");
const FeedbackModel = require("../../models/ConsumerFeedbackModel");

const UserService = {
    Userlogin: async (message, code) => {
        try {
            const { openid, session_key } = await wxAuth.wxAuth(code);

            // 查找或创建用户
            let user = await ConsumerModel.findOne({ openid });

            if (!user) {
                // 创建新用户
                user = new ConsumerModel({
                    openid,
                    session_key,
                    createTime: new Date(),
                });
                await user.save();

                console.log('创建新微信用户:', openid);
            }

            // 生成token，包含openid和过期时间（例如7天），如果过期将生成新的token
            const token = JWT.generate({ uid: user._id}, '7d');

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

            const newUser = new ConsumerModel({ 
                username: account,
                email: account, 
                password,
                createTime: new Date(),
            });

            await newUser.save();

            return {
                code: 200,
                success: true,
                message: '注册成功',
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

    }
}


module.exports = UserService