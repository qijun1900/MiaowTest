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

    // 更新用户信息
    updateUserInfo: async (req, res) => {
        try {
            const { openid, nickname, avatar, gender } = req.body;
            const result = await UserService.updateUserInfo({ openid, nickname, avatar, gender });

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
            const { openid } = req.user//获取用户openid
            const result = await UserService.addExamFavorite(examId, openid);
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
            const { openid } = req.user;

            const result = await UserService.getExamFavorites(examId, openid);
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
            const { openid } = req.user;
            const result = await UserService.removeExamFavorite(examId, openid);
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
    }
}


module.exports = UserController