var express = require('express');
const UserController = require('../../controllers/admin/UserController');
var UserRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/avataruploads/' })


UserRouter.post("/adminapi/user/login",UserController.login)//登录接口
UserRouter.post('/adminapi/user/upload',upload.single('file'),UserController.upload)
UserRouter.post("/adminapi/user/add",upload.single('file'),UserController.add)//添加用户
UserRouter.get("/adminapi/user/list",UserController.getList)//获取用户列表
UserRouter.get("/adminapi/user/list/:id",UserController.getList)//获取用户列表
UserRouter.post("/adminapi/user/deloneuser",UserController.delListOneUser)//删除单个用户
UserRouter.post("/adminapi/user/delmanyuser",UserController.delListManyUser)//删除多个用户
UserRouter.post("/adminapi/user/edituser",upload.single('file'),UserController.editUser)//编辑用户(新)



module.exports = UserRouter;