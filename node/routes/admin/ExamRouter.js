var express = require('express');
const ExamController = require('../../controllers/admin/ExamController');
var ExamRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/examcoveruploads/' })

//涉及文件上传
ExamRouter.post('/adminapi/exam/add',upload.single('file'),ExamController.add)


module.exports = ExamRouter; 