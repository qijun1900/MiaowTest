var express = require('express');
const ExamController = require('../../controllers/web/ExamController');
var ExamRouter = express.Router();




//涉及文件上传
ExamRouter.get('/webapi/Exam/getExamList',ExamController.getExamList)//获取考试列表
ExamRouter.get("/webapi/Exam/getOneExam/:id",ExamController.getOneExam)//获取单个考试详情

module.exports = ExamRouter; 