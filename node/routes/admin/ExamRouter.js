var express = require('express');
const ExamController = require('../../controllers/admin/ExamController');
var ExamRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/examcoveruploads/' })

//涉及文件上传
ExamRouter.post('/adminapi/exam/add',upload.single('file'),ExamController.add)//添加
ExamRouter.get('/adminapi/exam/list',ExamController.getexamList)//获取
ExamRouter.get('/adminapi/exam/list/:id',ExamController.getexamList)//获取
ExamRouter.post("/adminapi/exam/update",upload.single('file'),ExamController.updateInfo)//更新
ExamRouter.delete("/adminapi/exam/list/:id",ExamController.deleteInfo)//删除
ExamRouter.post("/adminapi/exam/selectquestion",ExamController.AddSelectQuestion)//获取



module.exports = ExamRouter; 