const UserService = require("../../services/user/UserService");

const UserController = {

    Userlogin: async (req, res) => {
        try {
            const { message, code } = req.body;
            const result = await UserService.Userlogin(message, code);
            res.send({
                code: 200,
                ActionType: "OK",
                data: result
            })
        } catch (error) {
            console.error("Userlogin 失败", error);
            throw error;
        }
    }
}


module.exports = UserController