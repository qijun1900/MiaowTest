var express = require('express');
const ExamController = require('../../controllers/admin/ExamController');
var ExamRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/examcoveruploads/' })

//涉及文件上传
ExamRouter.post('/adminapi/exam/add',upload.single('file'),ExamController.add)
ExamRouter.get('/adminapi/exam/list',ExamController.getexamList)
ExamRouter.get('/adminapi/exam/list/:id',ExamController.getexamList)
ExamRouter.post("/adminapi/exam/update",upload.single('file'),ExamController.updateInfo)



module.exports = ExamRouter; 