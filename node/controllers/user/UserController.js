const UserService = require("../../services/user/UserService");


const UserController = {
    Userlogin: async (req, res) => {
        try {
            const { message, code } = req.body;
            const result = await UserService.Userlogin(message, code);
            res.send({
                code: 200,
                ActionType: "OK",
                data: result.data,
            })
        } catch (error) {
            console.error("Userlogin 失败", error);
            throw error;
        }
    },
    UserRegister: async (req, res) => {
        try {
            const { account, verifyCode, password } = req.body;
            const result = await UserService.UserRegister(account, verifyCode, password);
            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    message: result.message,
                    data: result.data,
                })
            }
        }catch (error) {
            console.error("UserRegister 失败", error);
            throw error;
        }
    },
    // 用户账号登录
    UserAccountLogin: async (req, res) => {
        try {
            const { account, password } = req.body;
            const result = await UserService.UserAccountLogin(account, password);
            res.send({
                code: result.code,
                success: result.success,
                message: result.message,
                data: result.data || {},
            })
        }catch (error) {
            console.error("UserAccountLogin 失败", error);
            throw error;
        }
    },
    // 更新用户信息
    updateUserInfo: async (req, res) => {
        try {
            const { nickname, avatar, gender } = req.body;
            const { uid } = req.user//获取用户openid
            const result = await UserService.updateUserInfo({ uid, nickname, avatar, gender });

            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    message: result.message,
                    data: result.data
                });
            } else {
                res.send({
                    code: result.code,
                    ActionType: "ERROR",
                    message: result.message
                });
            }
        } catch (error) {
            console.error("updateUserInfo 失败", error);
            res.send({
                code: 500,
                ActionType: "ERROR",
                message: '服务器错误'
            });
        }
    },
    //收藏考试
    addExamFavorite: async (req, res) => {
        try {
            const { examId } = req.body;
            const { uid } = req.user//获取用户openid
            const result = await UserService.addExamFavorite(examId, uid);
            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    message: result.message,
                })
            } else {
                res.send({
                    code: result.code,
                    ActionType: "ERROR",
                    message: result.message
                });
            }
        } catch (error) {
            console.error("addExamFavorite 失败", error);
            res.send({
                code: 500,
                ActionType: "ERROR",
                message: '服务器错误'
            });
        }

    },
    //检测是否收藏
    getExamFavorites: async (req, res) => {
        try {
            const { examId } = req.body;
            const { uid } = req.user;

            const result = await UserService.getExamFavorites(examId, uid);
            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    data: result.data
                });
            } else {
                res.send({
                    code: result.code,
                    ActionType: "ERROR",
                });
            }
        } catch (error) {
            console.error("getExamFavorites 失败", error);
            res.send({
                code: 500,
                ActionType: "ERROR",
                message: '服务器错误'
            });
        }
    },
    //取消收藏
    removeExamFavorite: async (req, res) => {
        try {
            const { examId } = req.body;
            const { uid } = req.user;
            const result = await UserService.removeExamFavorite(examId, uid);
            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    message: result.message,
                })
            }
        } catch (error) {
            console.error("removeExamFavorite 失败", error);
            res.send({
                code: 500,
                ActionType: "ERROR",
                message: '服务器错误'
            });
        }
    },
    getUserFavoritesExam: async (req, res) => {
        try {
            const { uid } = req.user;
            const result = await UserService.getUserFavoritesExam(uid);  // 调用服务层方法获取用户收藏的考试
            if (result.success) {
                res.send({
                    code: 200,
                    ActionType: "OK",
                    data: result.data,
                });
            }
        }catch (error) {
            console.error("getUserFavoritesExam 失败", error);
            res.send({
                code: 500,
                ActionType: "ERROR",
                message: '服务器错误'
            });
        }
    }
}


module.exports = UserController