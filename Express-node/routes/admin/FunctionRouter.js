var express = require("express");
const FunctionController = require("../../controllers/admin/FunctionController");
var FunctionRouter = express.Router();
const multer = require("multer");
const upload = multer({ dest: "public/functionuploads/" });

/**
 * @swagger
 * /adminapi/todos/addtodo:
 *   post:
 *     tags: [管理员-待办]
 *     summary: 增加待办事项
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 待办标题
 *               content:
 *                 type: string
 *                 description: 待办内容
 *     responses:
 *       200:
 *         description: 成功
 */
FunctionRouter.post("/adminapi/todos/addtodo", FunctionController.AddTodos);
/**
 * @swagger
 * /adminapi/todos/gettodos:
 *   get:
 *     tags: [管理员-待办]
 *     summary: 获取待办事项列表
 *     responses:
 *       200:
 *         description: 成功
 */
FunctionRouter.get("/adminapi/todos/gettodos", FunctionController.GetTodos);
/**
 * @swagger
 * /adminapi/todos/updatetodo:
 *   post:
 *     tags: [管理员-待办]
 *     summary: 更新待办事项
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 待办事项ID
 *               title:
 *                 type: string
 *                 description: 待办标题
 *               content:
 *                 type: string
 *                 description: 待办内容
 *     responses:
 *       200:
 *         description: 成功
 */
FunctionRouter.post(
  "/adminapi/todos/updatetodo",
  FunctionController.UpdateTodos,
);
/**
 * @swagger
 * /adminapi/todos/deltodo:
 *   post:
 *     tags: [管理员-待办]
 *     summary: 删除待办事项
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 待办事项ID
 *     responses:
 *       200:
 *         description: 成功
 */
FunctionRouter.post("/adminapi/todos/deltodo", FunctionController.DeleteTodos);

module.exports = FunctionRouter;
