var express = require("express");
const ExamController = require("../../controllers/admin/ExamController");
var ExamRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

/**
 * @swagger
 * /adminapi/exam/add:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 添加考试科目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 考试封面图片
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/add",
  upload.single("file"),
  uploadToOSS("examcoveruploads"),
  ExamController.ExamAdd,
); //添加考试科目
/**
 * @swagger
 * /adminapi/exam/list:
 *   get:
 *     tags: [管理员-考试]
 *     summary: 获取考试科目列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get("/adminapi/exam/list", ExamController.getexamList); //获取多个考试科目
/**
 * @swagger
 * /adminapi/exam/update:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 更新考试科目信息
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 考试封面图片
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update",
  upload.single("file"),
  uploadToOSS("examcoveruploads"),
  ExamController.updateInfo,
); //更新考试科目信息
/**
 * @swagger
 * /adminapi/exam/updateExamStatus:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 更新考试科目状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, status]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 考试ID
 *               status:
 *                 type: number
 *                 description: 考试状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/updateExamStatus",
  ExamController.updateExamStatus,
); //更新考试科目状态
/**
 * @swagger
 * /adminapi/exam/deloneExam:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 删除单个考试科目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 考试ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post("/adminapi/exam/deloneExam", ExamController.deleteOneExamInfo); //删除单个考试科目信息
/**
 * @swagger
 * /adminapi/exam/delmanyExam:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 批量删除考试科目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 考试ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/delmanyExam",
  ExamController.deleteManyExamInfo,
); //删除多个考试科目信息
/**
 * @swagger
 * /adminapi/exam/get/questionList:
 *   get:
 *     tags: [管理员-考试]
 *     summary: 获取不同类型的题目列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/exam/get/questionList",
  ExamController.getSelectQuestionList,
); //获取不同类型的题目列表
/**
 * @swagger
 * /adminapi/exam/add/selectquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 添加选择题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 选择题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/add/selectquestion",
  ExamController.AddSelectQuestion,
); //添加选择题
/**
 * @swagger
 * /adminapi/exam/add/blankquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 添加填空题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 填空题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/add/blankquestion",
  ExamController.AddBlankQuestion,
); //添加填空题
/**
 * @swagger
 * /adminapi/exam/add/judgequestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 添加判断题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 判断题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/add/judgequestion",
  ExamController.AddJudgeQuestion,
); //添加判断题
/**
 * @swagger
 * /adminapi/exam/add/shortquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 添加简答题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 简答题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/add/shortquestion",
  ExamController.AddShortQuestionList,
); //添加简答题
/**
 * @swagger
 * /adminapi/exam/update/PublishQuestionstate:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新单条题目发布状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, published]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 题目ID
 *               published:
 *                 type: boolean
 *                 description: 发布状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update/PublishQuestionstate",
  ExamController.UpdateOneQuestion,
); //更新单条发布状态
/**
 * @swagger
 * /adminapi/exam/update/ManyPublishQuestionstate:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 批量更新题目发布状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids, published]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 题目ID列表
 *               published:
 *                 type: boolean
 *                 description: 发布状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update/ManyPublishQuestionstate",
  ExamController.UpdateBatchQuestion,
); //更新多条发布状态
/**
 * @swagger
 * /adminapi/exam/question/deleteOneQuestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 删除单个题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/question/deleteOneQuestion",
  ExamController.DeleteOneQuestion,
); //删除单个题目
/**
 * @swagger
 * /adminapi/exam/question/deleteManyQuestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 批量删除题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 题目ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/question/deleteManyQuestion",
  ExamController.DeleteManyQuestion,
); //删除多个题目
/**
 * @swagger
 * /adminapi/exam/whichOneQuestion/{id}:
 *   get:
 *     tags: [管理员-题型]
 *     summary: 获取单一题目详细信息
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 题目ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/exam/whichOneQuestion/:id",
  ExamController.getQuestionInfo,
); //获取单一题目详细信息
/**
 * @swagger
 * /adminapi/exam/update/selectquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新单条选择题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 选择题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update/selectquestion",
  ExamController.UpdateSelectQuestion,
); //更新单条选择题
/**
 * @swagger
 * /adminapi/exam/update/blankquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新单条填空题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 填空题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update/blankquestion",
  ExamController.UpdateBlankQuestion,
); //更新单条填空题
/**
 * @swagger
 * /adminapi/exam/update/judgequestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新单条判断题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 判断题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update/judgequestion",
  ExamController.UpdateJudgeQuestion,
); //更新单条判断题
/**
 * @swagger
 * /adminapi/exam/update/shortquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新单条简答题
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 简答题数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/update/shortquestion",
  ExamController.UpdateShortQuestionList,
); //更新单条简答题
/**
 * @swagger
 * /adminapi/exam/updateExamStatus:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 更新考试状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, status]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 考试ID
 *               status:
 *                 type: number
 *                 description: 考试状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/updateExamStatus",
  ExamController.UpdateExamStatus,
); //更新考试状态
/**
 * @swagger
 * /adminapi/exam/updateExamAuthStatus:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 更新考试认证状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, authStatus]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 考试ID
 *               authStatus:
 *                 type: number
 *                 description: 认证状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/updateExamAuthStatus",
  ExamController.UpdateExamAuthStatus,
); //更新考试认证状态
/**
 * @swagger
 * /adminapi/questionTitle/addQuestionTitle:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 增加题型
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 题型数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/questionTitle/addQuestionTitle",
  ExamController.AddquestionTitle,
); //增加题型
/**
 * @swagger
 * /adminapi/questionTitle/getQuestionTitleList:
 *   get:
 *     tags: [管理员-题型]
 *     summary: 获取考试题型列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/questionTitle/getQuestionTitleList",
  ExamController.getQuestionTitle,
); //获取用户端的考试题型列表
/**
 * @swagger
 * /adminapi/questionTitle/updateQuestionTitle:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新考试题型信息
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 题型数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/questionTitle/updateQuestionTitle",
  ExamController.UpdateQuestionTitle,
); //更新用户端的考试题型信息
/**
 * @swagger
 * /adminapi/questionTitle/checkQuestionTitle:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 检查考试题型是否还有题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 题型ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/questionTitle/checkQuestionTitle",
  ExamController.CheckQuestionTitle,
); //检查用户端的考试题型是否还有题目
/**
 * @swagger
 * /adminapi/questionTitle/deleteOneQuestionTitle:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 删除单个考试题型
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 题型ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/questionTitle/deleteOneQuestionTitle",
  ExamController.DeleteOneQuestionTitle,
); //删除用户端的单个考试题型信息
/**
 * @swagger
 * /adminapi/questionTitle/deleteManyQuestionTitle:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 批量删除考试题型
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 题型ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/questionTitle/deleteManyQuestionTitle",
  ExamController.DeleteManyQuestionTitle,
); //删除用户端的多个考试题型信息
/**
 * @swagger
 * /adminapi/questionTitle/updateQuestionOneTitleState:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 更新单条考试题型状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, status]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 题型ID
 *               status:
 *                 type: number
 *                 description: 题型状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/questionTitle/updateQuestionOneTitleState",
  ExamController.UpdateOneQuestionTitleState,
); //更新单条考试题型目状态
/**
 * @swagger
 * /adminapi/foruser/get/addQusetionList:
 *   get:
 *     tags: [管理员-题型]
 *     summary: 获取要添加的题目列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/foruser/get/addQusetionList",
  ExamController.getAddQusetionList,
); //获取要添加题目列表
/**
 * @swagger
 * /adminapi/foruser/addone/Addquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 向题型下添加单条题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 题目数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/foruser/addone/Addquestion",
  ExamController.AddOneQuestion,
); //向该题型下添加单条题目
/**
 * @swagger
 * /adminapi/foruser/addmany/Addquestion:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 向题型下添加多条题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questions]
 *             properties:
 *               questions:
 *                 type: array
 *                 description: 题目数据列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/foruser/addmany/Addquestion",
  ExamController.AddManyQuestion,
); //向该题型下添加多条题目
/**
 * @swagger
 * /adminapi/foruser/get/checkQusetionList:
 *   get:
 *     tags: [管理员-题型]
 *     summary: 获取已添加题目列表ID
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/foruser/get/checkQusetionList",
  ExamController.getCheckQusetionList,
); //获取已添加题目列表ID
/**
 * @swagger
 * /adminapi/foruser/get/matchQusetionList:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 根据ID和分类匹配题目信息
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids, category]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 题目ID列表
 *               category:
 *                 type: string
 *                 description: 题目分类
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/foruser/get/matchQusetionList",
  ExamController.MatchQusetionList,
); //根据_id和category匹配题目获取题目信息
/**
 * @swagger
 * /adminapi/foruser/post/RemoveUsersQuestionList:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 删除题型下的题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 题目ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/foruser/post/RemoveUsersQuestionList",
  ExamController.RemoveUserQuestionList,
); //删除该题型下的题目ids
/**
 * @swagger
 * /adminapi/exam/batchPublishedUserQuestionsList:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 批量发布用户端题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 题目ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/batchPublishedUserQuestionsList",
  ExamController.batchPublishedUserQuestionsList,
); //批量发布用户端的题目
/**
 * @swagger
 * /adminapi/exam/publishedUserQuestionsList/{id}:
 *   get:
 *     tags: [管理员-题型]
 *     summary: 获取用户端已发布的题目
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 题型ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/exam/publishedUserQuestionsList/:id",
  ExamController.getUserQuestionsList,
); //获取用户端已发布的题目
/**
 * @swagger
 * /adminapi/exam/UserquestionlistDown/{id}:
 *   post:
 *     tags: [管理员-题型]
 *     summary: 用户端题目全部下架
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 题型ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/exam/UserquestionlistDown/:id",
  ExamController.UserquestionlistDown,
); //不同类型题目用户端的题目全部下架操作

// ==============网盘资料管理相关API ========== //
/**
 * @swagger
 * /adminapi/netDisk/addNetDisk:
 *   post:
 *     tags: [管理员-网盘]
 *     summary: 添加网盘资料
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 网盘资料数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post("/adminapi/netDisk/addNetDisk", ExamController.AddNetDisk); //添加网盘资料
/**
 * @swagger
 * /adminapi/netDisk/getNetDiskList:
 *   get:
 *     tags: [管理员-网盘]
 *     summary: 获取网盘资料列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.get(
  "/adminapi/netDisk/getNetDiskList",
  ExamController.getNetDiskList,
); //获取网盘资料列表
/**
 * @swagger
 * /adminapi/netDisk/updateNetDisk:
 *   post:
 *     tags: [管理员-网盘]
 *     summary: 更新网盘资料信息
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 网盘资料数据
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/netDisk/updateNetDisk",
  ExamController.UpdateNetDisk,
); //更新网盘资料信息
/**
 * @swagger
 * /adminapi/netDisk/updateNetDiskState:
 *   post:
 *     tags: [管理员-网盘]
 *     summary: 更新网盘资料状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, status]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 网盘资料ID
 *               status:
 *                 type: number
 *                 description: 资料状态
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/netDisk/updateNetDiskState",
  ExamController.UpdateNetDiskState,
); //更新网盘资料状态
/**
 * @swagger
 * /adminapi/netDisk/deleteOneNetDisk:
 *   post:
 *     tags: [管理员-网盘]
 *     summary: 删除单个网盘资料
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 网盘资料ID
 *     responses:
 *       200:
 *         description: 成功
 */
ExamRouter.post(
  "/adminapi/netDisk/deleteOneNetDisk",
  ExamController.DeleteOneNetDisk,
); //删除单个网盘资料信息

module.exports = ExamRouter;
