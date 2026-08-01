var express = require("express");
const UserController = require("../../controllers/admin/UserController");
var UserRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

/**
 * @swagger
 * /adminapi/user/login:
 *   post:
 *     tags: [管理员-用户]
 *     summary: 管理员登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post("/adminapi/user/login", UserController.login); //登录接口
/**
 * @swagger
 * /adminapi/user/upload:
 *   post:
 *     tags: [管理员-用户]
 *     summary: 上传用户头像
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
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
  "/adminapi/user/upload",
  upload.single("file"),
  uploadToOSS("avataruploads"),
  UserController.upload,
);
/**
 * @swagger
 * /adminapi/user/add:
 *   post:
 *     tags: [管理员-用户]
 *     summary: 添加用户
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
 *                 description: 用户头像文件
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/adminapi/user/add",
  upload.single("file"),
  uploadToOSS("avataruploads"),
  UserController.add,
); //添加用户
/**
 * @swagger
 * /adminapi/user/list:
 *   get:
 *     tags: [管理员-用户]
 *     summary: 获取用户列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.get("/adminapi/user/list", UserController.getList); //获取用户列表
/**
 * @swagger
 * /adminapi/user/list/{id}:
 *   get:
 *     tags: [管理员-用户]
 *     summary: 根据ID获取用户列表
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.get("/adminapi/user/list/:id", UserController.getList); //获取用户列表
/**
 * @swagger
 * /adminapi/user/deloneuser:
 *   post:
 *     tags: [管理员-用户]
 *     summary: 删除单个用户
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
 *                 description: 用户ID
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post("/adminapi/user/deloneuser", UserController.delListOneUser); //删除单个用户
/**
 * @swagger
 * /adminapi/user/delmanyuser:
 *   post:
 *     tags: [管理员-用户]
 *     summary: 批量删除用户
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
 *                 description: 用户ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post("/adminapi/user/delmanyuser", UserController.delListManyUser); //删除多个用户
/**
 * @swagger
 * /adminapi/user/edituser:
 *   post:
 *     tags: [管理员-用户]
 *     summary: 编辑用户信息
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
 *                 description: 用户头像文件
 *     responses:
 *       200:
 *         description: 成功
 */
UserRouter.post(
  "/adminapi/user/edituser",
  upload.single("file"),
  uploadToOSS("avataruploads"),
  UserController.editUser,
); //编辑用户(新)

module.exports = UserRouter;
