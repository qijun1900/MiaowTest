const UserService = require("../../services/admin/UserService");
const JWT = require("../../MiddleWares/jwt")

const UserController = {
    login: async (req, res) => {
        const result = await UserService.login(req.body);
        if (result.length === 0) {
            res.send({
                code: "-1",
                err: "用户名或密码不匹配"
            });
        } else {
            //生成token
            const token = JWT.generate({
                _id:result[0].id,
                username:result[0].username
            },"1d")
            res.header("authorization", token)
            res.send({
                ActionType: "OK",
                data:{
                    username:result[0].username,
                    gender:result[0].gender?result[0].gender:0,
                    introduction:result[0].introduction,
                    avatar:result[0].avatar,
                    role:result[0].role,
                }
            });
        }
    },
    upload:async (req,res)=>{
        const {username,introduction,gender} = req.body
        const avatar = req.file ? `/avataruploads/${req.file.filename}`:""
        const token = req.headers["authorization"].split(" ")[1]
        var payload = JWT.verify(token)
       await UserService.upload({
            _id:payload._id,
            username,
            introduction,
            gender:Number(gender),
            avatar
        })
        if(avatar){
            res.send({
                ActionType:"OK_更新完毕",
                data:{
                    username,
                    introduction,
                    gender:Number(gender),
                    avatar
                }
            })
        }else{
            res.send({
                ActionType:"OK_更新完毕",
                data:{
                    username,
                    introduction,
                    gender:Number(gender),
                }
            })
        }
    },
    add:async (req,res)=>{
        const {username,introduction,gender,role,password} = req.body
        const avatar = req.file ? `/avataruploads/${req.file.filename}`:""
       await UserService.add({
            username,
            introduction,
            gender:Number(gender),
            avatar,
            role:Number(role),
            password,
        })
        res.send({
            ActionType:"OK"
        })
    },
    getList:async (req,res)=>{
        const result = await UserService.getlist(req.params)
        res.send({

            ActionType:"OK",  
            data:result
        })
    },
    delList:async (req,res)=>{
        const result = await UserService.dellist({_id:req.params.id})
        res.send({
            ActionType:"OK",  
        })

    },
    putList:async (req,res)=>{
        const result = await UserService.putlist(req.body)
        res.send({
            ActionType:"OK",  
        })

    },
};
module.exports = UserController;