var express = require('express');
const FunctionController = require('../../controllers/admin/FunctionController');
var FunctionRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/functionuploads/' })

FunctionRouter.post("/adminapi/todos/addtodo",FunctionController.AddTodos)// 增加todo
FunctionRouter.get("/adminapi/todos/gettodos",FunctionController.GetTodos)// 获取todo
FunctionRouter.post("/adminapi/todos/updatetodo",FunctionController.UpdateTodos)// 更新todo
FunctionRouter.post('/adminapi/todos/deltodo',FunctionController.DeleteTodos)// 删除todo


module.exports = FunctionRouter; 