var express = require('express');
const ExamController = require('../../controllers/web/ExamController');
var ExamRouter = express.Router();




//涉及文件上传
ExamRouter.get('/webapi/Exam/getExamList',ExamController.getExamList)//获取考试列表


module.exports = ExamRouter; 