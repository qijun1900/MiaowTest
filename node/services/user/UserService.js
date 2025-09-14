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
            } else {
                // 更新现有用户
                user.session_key = session_key;

                await user.save();
                console.log('更新用户信息:', openid);
            }
            
            // 生成token，包含openid和过期时间（例如7天）
            const token = JWT.generate({ openid: openid }, '7d');
            
            // 返回更完整的用户信息
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
    }
}

module.exports = UserService