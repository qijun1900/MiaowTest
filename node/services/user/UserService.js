const wxAuth = require("../../MiddleWares/wxAuth");
const JWT = require("../../MiddleWares/jwt");
const ConsumerModel = require("../../models/ConsumerModel");

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

                console.log('创建新用户:', openid);
            }
            
            // 生成token，包含openid和过期时间（例如7天），如果过期将生成新的token
            const token = JWT.generate({ openid: openid }, '7d');
            
            return {
                success: true,
                data: {
                    token,
                    userInfo: {
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
    updateUserInfo: async ({openid,nickname,avatar,gender}) => {
        try {
            const user = await ConsumerModel.findOne({ openid });
            
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
    }
}

module.exports = UserService