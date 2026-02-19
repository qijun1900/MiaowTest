const UserService = require("../../services/admin/UserService");
const JWT = require("../../MiddleWares/jwt")

const UserController = {
    login: async (req, res) => {
        const result = await UserService.login(req.body);
        if (result.length === 0) {
            res.status(200).send({
                code: "-1",
                error: "用户名或密码不匹配"
            });
        }else {
            //生成token
            const token = JWT.generate({
                _id:result[0].id,
                username:result[0].username
            },"1d")
            res.header("authorization", token)
            res.status(200).send({
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
            res.status(200).send({
                ActionType:"OK",
                data:{
                    username,
                    introduction,
                    gender:Number(gender),
                    avatar
                }
            })
        }else{
            res.status(200).send({
                ActionType:"OK",
                data:{
                    username,
                    introduction,
                    gender:Number(gender),
                }
            })
        }
    },
    add:async (req,res)=>{
        const {username,introduction,gender,role,password,state} = req.body
        const avatar = req.file ? `/avataruploads/${req.file.filename}`:""
       await UserService.add({
            username,
            introduction,
            gender:Number(gender),
            avatar,
            role:Number(role),
            password,
            state:Number(state),
            createTime:Date.now()
        })
        res.status(200).send({
            ActionType:"OK"
        })
    },
    getList:async (req,res)=>{
        const {page,size} = req.query
        const result = await UserService.getlist({
            ...req.params,
            page: Number(page),
            size: Number(size)
        })
        res.status(200).send({
            ActionType:"OK",  
            data:result,
            total: result.total
        })
    },
    delListOneUser:async (req,res)=>{
        const {_id} = req.body
        const result = await UserService.dellist({_id})
        res.status(200).send({
            ActionType:"OK",  
        })

    },
    putList:async (req,res)=>{
        const result = await UserService.putlist(req.body)
        res.status(200).send({
            ActionType:"OK",  
        })

    },
        delListManyUser:async (req,res)=>{
        const {_ids} = req.body
        console.log(_ids)
        const result = await UserService.delManylist({_ids})
        res.status(200).send({
            ActionType:"OK",
        })
    },
    editUser:async (req,res)=>{
        const {_id,username,introduction,gender,role,state} = req.body
        const avatar = req.file ? `/avataruploads/${req.file.filename}`:""
        const result = await UserService.editUser({
            _id,
            username,
            introduction,
            gender,
            role,
            state,
            avatar
        })
        res.status(200).send({
            ActionType:"OK",
        })
    }
};
module.exports = UserController;