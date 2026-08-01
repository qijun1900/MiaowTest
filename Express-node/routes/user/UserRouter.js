var express = require("express");
const UserController = require("../../controllers/user/UserController");
const JWT = require("../../MiddleWares/jwt"); // 引入JWT中间件，用于验证token
var UserRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/User/Userlogin:
 *   post:
 *     tags: [用户-认证]
 *     summary: 微信登录接口
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信登录code
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post("/uniappAPI/User/Userlogin", UserController.Userlogin); //微信登录接口
/**
 * @swagger
 * /uniappAPI/User/sendVerifyCode:
 *   post:
 *     tags: [用户-认证]
 *     summary: 发送邮箱验证码
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/sendVerifyCode",
  UserController.sendVerifyCode,
); //发送邮箱验证码接口
/**
 * @swagger
 * /uniappAPI/User/UserRegister:
 *   post:
 *     tags: [用户-认证]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               password:
 *                 type: string
 *                 description: 密码
 *               verifyCode:
 *                 type: string
 *                 description: 邮箱验证码
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post("/uniappAPI/User/UserRegister", UserController.UserRegister); //用户注册接口
/**
 * @swagger
 * /uniappAPI/User/UserAccountLogin:
 *   post:
 *     tags: [用户-认证]
 *     summary: 用户账号密码登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/UserAccountLogin",
  UserController.UserAccountLogin,
); //用户账号登录接口
/**
 * @swagger
 * /uniappAPI/User/ResetPassword:
 *   post:
 *     tags: [用户-认证]
 *     summary: 重置密码（忘记密码）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               password:
 *                 type: string
 *                 description: 新密码
 *               verifyCode:
 *                 type: string
 *                 description: 邮箱验证码
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/ResetPassword",
  UserController.ResetPassword,
); //用户忘记密码 / 重置密码接口
/**
 * @swagger
 * /uniappAPI/User/reportLoginStatus:
 *   post:
 *     tags: [用户-认证]
 *     summary: 用户登录状态上报（每日热力图）
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/reportLoginStatus",
  JWT.verifyTokenMiddleware(),
  UserController.reportLoginStatus,
); //用户登录状态上报接口（每日热力）
/**
 * @swagger
 * /uniappAPI/User/updateUserInfo:
 *   post:
 *     tags: [用户-资料]
 *     summary: 更新用户信息
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 用户信息字段
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/updateUserInfo",
  JWT.verifyTokenMiddleware(),
  UserController.updateUserInfo,
); //用户更新信息接口
/**
 * @swagger
 * /uniappAPI/uploadFile/useravatar:
 *   post:
 *     tags: [用户-资料]
 *     summary: 上传用户头像
 *     security:
 *       - BearerAuth: []
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
 *                 description: 头像文件
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/uploadFile/useravatar",
  JWT.verifyTokenMiddleware(),
  UserController.uploadUserAvatar,
); //用户上传头像接口
/**
 * @swagger
 * /uniappAPI/uploadFile/cloudAvatar:
 *   post:
 *     tags: [用户-资料]
 *     summary: 云托管上传头像
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cloudFileID:
 *                 type: string
 *                 description: 微信云存储文件ID
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/uploadFile/cloudAvatar",
  JWT.verifyTokenMiddleware(),
  UserController.uploadCloudAvatar,
); //云托管上传头像接口
/**
 * @swagger
 * /uniappAPI/UserFavorite/addExamFavorite:
 *   post:
 *     tags: [用户-收藏]
 *     summary: 添加收藏考试
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
UserRouter.post(
  "/uniappAPI/UserFavorite/addExamFavorite",
  JWT.verifyTokenMiddleware(),
  UserController.addExamFavorite,
); //添加用户收藏考试接口
/**
 * @swagger
 * /uniappAPI/UserFavorite/getExamFavorites:
 *   post:
 *     tags: [用户-收藏]
 *     summary: 检测是否已收藏考试
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
UserRouter.post(
  "/uniappAPI/UserFavorite/getExamFavorites",
  JWT.verifyTokenMiddleware(),
  UserController.getExamFavorites,
); //检测是否收藏考试接口
/**
 * @swagger
 * /uniappAPI/UserFavorite/removeExamFavorite:
 *   post:
 *     tags: [用户-收藏]
 *     summary: 取消收藏考试
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
UserRouter.post(
  "/uniappAPI/UserFavorite/removeExamFavorite",
  JWT.verifyTokenMiddleware(),
  UserController.removeExamFavorite,
); //用户取消收藏考试接口
/**
 * @swagger
 * /uniappAPI/UserFavorite/getUserFavoritesExams:
 *   get:
 *     tags: [用户-收藏]
 *     summary: 获取用户收藏的考试列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.get(
  "/uniappAPI/UserFavorite/getUserFavoritesExams",
  JWT.verifyTokenMiddleware(),
  UserController.getUserFavoritesExam,
); //用户获取收藏的考试接口
/**
 * @swagger
 * /uniappAPI/User/BindAccount:
 *   post:
 *     tags: [用户-绑定]
 *     summary: 当前账号绑定邮箱（微信用户补绑邮箱）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               verifyCode:
 *                 type: string
 *                 description: 邮箱验证码
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/BindAccount",
  JWT.verifyTokenMiddleware(),
  UserController.BindAccount,
); //当前账号绑定邮箱（用于微信用户补绑邮箱）
/**
 * @swagger
 * /uniappAPI/User/BindWechat:
 *   post:
 *     tags: [用户-绑定]
 *     summary: 当前账号绑定微信（邮箱用户补绑微信）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信登录code
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/User/BindWechat",
  JWT.verifyTokenMiddleware(),
  UserController.BindWechat,
); //当前账号绑定微信（用于邮箱用户补绑微信）
/**
 * @swagger
 * /uniappAPI/User/checkUserBind:
 *   get:
 *     tags: [用户-绑定]
 *     summary: 查询当前账号的绑定状态（邮箱/微信）
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.get(
  "/uniappAPI/User/checkUserBind",
  JWT.verifyTokenMiddleware(),
  UserController.checkUserBind,
); //查询当前账号的绑定状态（邮箱 / 微信）
/**
 * @swagger
 * /uniappAPI/Feedback/submitFeedback:
 *   post:
 *     tags: [用户-反馈]
 *     summary: 用户提交反馈（认证可选）
 *     description: 认证可选，未登录用户也可提交反馈
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 反馈内容
 *               contact:
 *                 type: string
 *                 description: 联系方式
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/Feedback/submitFeedback",
  JWT.optionalTokenMiddleware(),
  UserController.userFeedback,
); //用户提交反馈接口
/**
 * @swagger
 * /uniappAPI/exam/savePracticeNote:
 *   post:
 *     tags: [用户-练习笔记]
 *     summary: 保存练习笔记
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
 *               note:
 *                 type: string
 *                 description: 笔记内容
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/exam/savePracticeNote",
  JWT.verifyTokenMiddleware(),
  UserController.savePracticeNote,
); //用户保存练习笔记接口-
/**
 * @swagger
 * /uniappAPI/exam/getPracticeNote:
 *   post:
 *     tags: [用户-练习笔记]
 *     summary: 获取练习笔记
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
UserRouter.post(
  "/uniappAPI/exam/getPracticeNote",
  JWT.verifyTokenMiddleware(),
  UserController.getPracticeNote,
); //用户获取练习笔记接口-
/**
 * @swagger
 * /uniappAPI/UserNote/getNoteExamList:
 *   get:
 *     tags: [用户-笔记列表]
 *     summary: 获取笔记科目列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.get(
  "/uniappAPI/UserNote/getNoteExamList",
  JWT.verifyTokenMiddleware(),
  UserController.getNoteExamList,
); //用户获取笔记科目列表接口-
/**
 * @swagger
 * /uniappAPI/UserNote/getNoteListByExamId:
 *   post:
 *     tags: [用户-笔记列表]
 *     summary: 根据科目ID获取笔记列表
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
 *                 description: 考试科目ID
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/UserNote/getNoteListByExamId",
  JWT.verifyTokenMiddleware(),
  UserController.getNoteListByExamId,
); //根据科目id用户获取笔记列表接口-
/**
 * @swagger
 * /uniappAPI/exam/saveUserBankPracticeNote:
 *   post:
 *     tags: [用户-练习笔记]
 *     summary: 保存用户自建题库题目练习笔记
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
 *               note:
 *                 type: string
 *                 description: 笔记内容
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/exam/saveUserBankPracticeNote",
  JWT.verifyTokenMiddleware(),
  UserController.saveUserBankPracticeNote,
); //用户保存自己题库题目练习笔记接口-
/**
 * @swagger
 * /uniappAPI/exam/getUserBankPracticeNote:
 *   post:
 *     tags: [用户-练习笔记]
 *     summary: 获取用户自建题库题目练习笔记
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
UserRouter.post(
  "/uniappAPI/exam/getUserBankPracticeNote",
  JWT.verifyTokenMiddleware(),
  UserController.getUserBankPracticeNote,
); //用户获取自己题库题目练习笔记接口-

/************简单小工具api*********** */
/**
 * @swagger
 * /uniappAPI/set/TodayTodos:
 *   post:
 *     tags: [用户-待办]
 *     summary: 设置今日待办事项
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 待办内容
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/set/TodayTodos",
  JWT.verifyTokenMiddleware(),
  UserController.setTodayTodos,
); //设置今日待办事项接口-
/**
 * @swagger
 * /uniappAPI/get/dotDates:
 *   get:
 *     tags: [用户-待办]
 *     summary: 获取待办事项日期列表（日历圆点标记）
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.get(
  "/uniappAPI/get/dotDates",
  JWT.verifyTokenMiddleware(),
  UserController.getDotDates,
); //获取待办事项日期列表接口-用来显示圆点
/**
 * @swagger
 * /uniappAPI/get/TodayTodos:
 *   post:
 *     tags: [用户-待办]
 *     summary: 获取今日待办事项列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/get/TodayTodos",
  JWT.verifyTokenMiddleware(),
  UserController.getTodayTodos,
); //获取今日待办事项接口-
/**
 * @swagger
 * /uniappAPI/set/toggleTodoStatus:
 *   post:
 *     tags: [用户-待办]
 *     summary: 切换待办事项完成状态
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todoId:
 *                 type: string
 *                 description: 待办事项ID
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/set/toggleTodoStatus",
  JWT.verifyTokenMiddleware(),
  UserController.toggleTodoStatus,
); //切换待办事项完成状态接口-
/**
 * @swagger
 * /uniappAPI/set/deleteTodo:
 *   post:
 *     tags: [用户-待办]
 *     summary: 删除待办事项
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todoId:
 *                 type: string
 *                 description: 待办事项ID
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/set/deleteTodo",
  JWT.verifyTokenMiddleware(),
  UserController.deleteTodo,
); //删除待办事项接口-
/**
 * @swagger
 * /uniappAPI/set/editTodo:
 *   post:
 *     tags: [用户-待办]
 *     summary: 编辑待办事项
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todoId:
 *                 type: string
 *                 description: 待办事项ID
 *               content:
 *                 type: string
 *                 description: 待办内容
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/uniappAPI/set/editTodo",
  JWT.verifyTokenMiddleware(),
  UserController.editTodo,
); //编辑待办事项接口-

module.exports = UserRouter;
