var express = require("express");
const ExamController = require("../../controllers/user/ExamController");
var ExamRouter = express.Router();
const JWT = require("../../MiddleWares/jwt"); // 引入JWT中间件，用于验证token

//uniappAPI
/**
 * @swagger
 * /uniappAPI/IndexHotExam/getHotExamList:
 *   get:
 *     tags: [用户-首页]
 *     summary: 获取热门考试列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/IndexHotExam/getHotExamList",
  ExamController.getHotExamList,
); //获取热门考试
/**
 * @swagger
 * /uniappAPI/Exam/getExamSubjects:
 *   get:
 *     tags: [用户-考试]
 *     summary: 获取所有考试科目
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/Exam/getExamSubjects",
  ExamController.getExamSubjects,
); //获取所有考试科目
/**
 * @swagger
 * /uniappAPI/Exam/getExamSubjectTypes/{id}:
 *   get:
 *     tags: [用户-考试]
 *     summary: 获取单个考试科目下的所有考试题型
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试科目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/Exam/getExamSubjectTypes/:id",
  ExamController.getExamSubjectTypes,
); //获取单个考试科目下的所有考试题型
/**
 * @swagger
 * /uniappAPI/Exam/FetchMatchQuestionList:
 *   post:
 *     tags: [用户-考试]
 *     summary: 获取匹配的题目列表
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: 考试科目ID
 *               typeId:
 *                 type: string
 *                 description: 题型ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/Exam/FetchMatchQuestionList",
  ExamController.FetchMatchQuestionList,
); //获取匹配的题目题
/**
 * @swagger
 * /uniappAPI/exam/useradd/question:
 *   post:
 *     tags: [用户-题库]
 *     summary: 用户添加自己的题目
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 题目信息
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/useradd/question",
  JWT.verifyTokenMiddleware(),
  ExamController.useraddquestion,
); //用户添加自己的题目
/**
 * @swagger
 * /uniappAPI/exam/AddUserBank:
 *   post:
 *     tags: [用户-题库]
 *     summary: 用户添加自己的题库
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *                 description: 题库名称
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/AddUserBank",
  JWT.verifyTokenMiddleware(),
  ExamController.AddUserBank,
); //用户添加自己的题库
/**
 * @swagger
 * /uniappAPI/Exam/getUserBankList:
 *   get:
 *     tags: [用户-题库]
 *     summary: 获取用户的题库列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/Exam/getUserBankList",
  JWT.verifyTokenMiddleware(),
  ExamController.getUserBankList,
); //获取用户的题库列表
/**
 * @swagger
 * /uniappAPI/exam/getUserBankQuestionList/{id}:
 *   get:
 *     tags: [用户-题库]
 *     summary: 获取用户的题库题目列表
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 题库ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/exam/getUserBankQuestionList/:id",
  JWT.verifyTokenMiddleware(),
  ExamController.getUserBankQuestionList,
); //获取用户的题库题目
/**
 * @swagger
 * /uniappAPI/exam/userupdate/question:
 *   post:
 *     tags: [用户-题库]
 *     summary: 用户更新自己的题目
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 题目更新信息
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/userupdate/question",
  JWT.verifyTokenMiddleware(),
  ExamController.userUpdateQuestion,
); //用户更新自己的题目
/**
 * @swagger
 * /uniappAPI/exam/userdelete/question:
 *   post:
 *     tags: [用户-题库]
 *     summary: 用户删除自己的题目
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/userdelete/question",
  JWT.verifyTokenMiddleware(),
  ExamController.userDeleteQuestion,
); //用户删除自己的题目
/**
 * @swagger
 * /uniappAPI/exam/userdelete/bank:
 *   post:
 *     tags: [用户-题库]
 *     summary: 用户删除自己的题库
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankId:
 *                 type: string
 *                 description: 题库ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/userdelete/bank",
  JWT.verifyTokenMiddleware(),
  ExamController.userDeleteBank,
); //用户删除自己的题库
/**
 * @swagger
 * /uniappAPI/exam/useradd/wrongquestion:
 *   post:
 *     tags: [用户-错题]
 *     summary: 将错题加入错题本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/useradd/wrongquestion",
  JWT.verifyTokenMiddleware(),
  ExamController.userAddWrongQuestion,
); //用户将错题加入错题本
/**
 * @swagger
 * /uniappAPI/exam/userdelete/wrongquestion:
 *   post:
 *     tags: [用户-错题]
 *     summary: 将错题从错题本删除
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/userdelete/wrongquestion",
  JWT.verifyTokenMiddleware(),
  ExamController.userDeleteWrongQuestion,
); //用户将错题从错题本删除
/**
 * @swagger
 * /uniappAPI/exam/useradd/favoritequestion:
 *   post:
 *     tags: [用户-题目收藏]
 *     summary: 将题目加入收藏
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/useradd/favoritequestion",
  JWT.verifyTokenMiddleware(),
  ExamController.userAddFavoriteQuestion,
); //用户将题目加入收藏
/**
 * @swagger
 * /uniappAPI/exam/userdelete/favoritequestion:
 *   post:
 *     tags: [用户-题目收藏]
 *     summary: 将题目从收藏删除
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/userdelete/favoritequestion",
  JWT.verifyTokenMiddleware(),
  ExamController.userDeleteFavoriteQuestion,
); //用户将题目从收藏删除
/**
 * @swagger
 * /uniappAPI/exam/getUserFavoriteQuestionList:
 *   get:
 *     tags: [用户-题目收藏]
 *     summary: 获取用户的收藏题目列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/exam/getUserFavoriteQuestionList",
  JWT.verifyTokenMiddleware(),
  ExamController.getUserFavoriteQuestionList,
); //获取用户的收藏题目
/**
 * @swagger
 * /uniappAPI/exam/checkFavoriteQuestion:
 *   post:
 *     tags: [用户-题目收藏]
 *     summary: 检查题目是否已收藏
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/checkFavoriteQuestion",
  JWT.verifyTokenMiddleware(),
  ExamController.checkFavoriteQuestion,
); //检查题目是否已收藏
/**
 * @swagger
 * /uniappAPI/exam/userpractice/question:
 *   post:
 *     tags: [用户-题目收藏]
 *     summary: 用户点击题目进行练习（收藏与错题本）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/userpractice/question",
  JWT.verifyTokenMiddleware(),
  ExamController.userPracticeFavoriteQuestion,
); //用户点击题目进行练习(收藏与错题本)
/**
 * @swagger
 * /uniappAPI/exam/getUserWrongQuestionList:
 *   get:
 *     tags: [用户-错题]
 *     summary: 获取用户的错题列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/uniappAPI/exam/getUserWrongQuestionList",
  JWT.verifyTokenMiddleware(),
  ExamController.getUserWrongQuestionList,
); //获取用户的错题列表
/**
 * @swagger
 * /uniappAPI/exam/getexamsubjectmaterials:
 *   post:
 *     tags: [用户-网盘]
 *     summary: 获取考试科目对应的网盘资源列表
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: 考试科目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/getexamsubjectmaterials",
  ExamController.getExamSubjectMaterials,
); //获取考试科目对应的网盘资源列表
/**
 * @swagger
 * /uniappAPI/exam/getexamsubjecttitleurl:
 *   post:
 *     tags: [用户-网盘]
 *     summary: 获取考试科目对应的网盘资源URL
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceId:
 *                 type: string
 *                 description: 资源ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/getexamsubjecttitleurl",
  JWT.verifyTokenMiddleware(),
  ExamController.getExamSubjectTitleUrl,
); //获取考试科目对应的网盘资源url
/**
 * @swagger
 * /uniappAPI/exam/checkexamverify:
 *   post:
 *     tags: [用户-考试]
 *     summary: 检查考试是否已认证
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               examId:
 *                 type: string
 *                 description: 考试ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/uniappAPI/exam/checkexamverify",
  JWT.verifyTokenMiddleware(),
  ExamController.checkExamVerify,
); //检查考试是否已认证

module.exports = ExamRouter;
