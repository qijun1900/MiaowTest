const wxAuth = require("../../MiddleWares/wxAuth");
const JWT = require("../../MiddleWares/jwt");
const ConsumerModel = require("../../models/ConsumerModel");
const ExamModel = require("../../models/ExamModel");

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

    // 更新用户信息
    updateUserInfo: async ({ uid, nickname, avatar, gender }) => {
        try {
            const user = await ConsumerModel.findOne({ uid });

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
    }
}

module.exports = UserService