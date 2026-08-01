var express = require("express");
const NotesBookController = require("../../controllers/user/NotesBookController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var NotesBookRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/tools/notebook/getNotebooks:
 *   get:
 *     tags: [用户-笔记本]
 *     summary: 获取笔记本列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
//获取笔记本列表
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebooks,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/getNotebookDetail:
 *   get:
 *     tags: [用户-笔记本]
 *     summary: 获取笔记本详情
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 笔记本ID
 *     responses:
 *       200:
 *         description: 成功
 */
//获取笔记本详情
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/createNotebook:
 *   post:
 *     tags: [用户-笔记本]
 *     summary: 创建笔记本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 description: 笔记本名称
 *               description:
 *                 type: string
 *                 description: 笔记本描述
 *     responses:
 *       200:
 *         description: 成功
 */
//创建笔记本
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/createNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.createNotebook,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/updateNotebook:
 *   post:
 *     tags: [用户-笔记本]
 *     summary: 更新笔记本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, title]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 笔记本ID
 *               title:
 *                 type: string
 *                 description: 笔记本名称
 *               description:
 *                 type: string
 *                 description: 笔记本描述
 *     responses:
 *       200:
 *         description: 成功
 */
//更新笔记本
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/updateNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.updateNotebook,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/deleteNotebook:
 *   post:
 *     tags: [用户-笔记本]
 *     summary: 删除笔记本
 *     security:
 *       - BearerAuth: []
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
 *                 description: 笔记本ID
 *     responses:
 *       200:
 *         description: 成功
 */
//删除笔记本
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/deleteNotebook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.deleteNotebook,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/getNotebookNotes:
 *   get:
 *     tags: [用户-笔记本]
 *     summary: 获取笔记本内的笔记列表
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 笔记本ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 12
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 成功
 */
//获取笔记本内的笔记列表
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookNotes",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookNotes,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/getNotebookNoteDetail:
 *   get:
 *     tags: [用户-笔记本]
 *     summary: 获取笔记本内的笔记详情
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 笔记ID
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *         description: 笔记本ID
 *     responses:
 *       200:
 *         description: 成功
 */
//获取笔记本内的笔记详情
NotesBookRouter.get(
  "/uniappAPI/tools/notebook/getNotebookNoteDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.getNotebookNoteDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/saveNotebookNote:
 *   post:
 *     tags: [用户-笔记本]
 *     summary: 保存笔记本内的笔记（新增或更新）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 笔记ID（更新时必传）
 *               bookId:
 *                 type: string
 *                 description: 笔记本ID
 *               title:
 *                 type: string
 *                 description: 笔记标题
 *               content:
 *                 type: string
 *                 description: 笔记内容
 *               tags:
 *                 type: array
 *                 description: 标签列表
 *               isMarkdown:
 *                 type: boolean
 *                 description: 是否为Markdown格式
 *               isAIgenerated:
 *                 type: boolean
 *                 description: 是否为AI生成
 *               AIIntegrationInfo:
 *                 type: object
 *                 description: AI集成信息
 *     responses:
 *       200:
 *         description: 成功
 */
//保存笔记本内的笔记（新增或更新）
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/saveNotebookNote",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.saveNotebookNote,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/toggleNotebookNotePin:
 *   post:
 *     tags: [用户-笔记本]
 *     summary: 切换笔记置顶状态
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, bookId]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 笔记ID
 *               bookId:
 *                 type: string
 *                 description: 笔记本ID
 *               isPinned:
 *                 type: boolean
 *                 description: 指定置顶状态（可选，不传则切换）
 *     responses:
 *       200:
 *         description: 成功
 */
//切换笔记置顶状态
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/toggleNotebookNotePin",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.toggleNotebookNotePin,
);

/**
 * @swagger
 * /uniappAPI/tools/notebook/deleteNotebookNote:
 *   post:
 *     tags: [用户-笔记本]
 *     summary: 删除笔记本内的笔记
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, bookId]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 笔记ID
 *               bookId:
 *                 type: string
 *                 description: 笔记本ID
 *     responses:
 *       200:
 *         description: 成功
 */
//删除笔记本内的笔记
NotesBookRouter.post(
  "/uniappAPI/tools/notebook/deleteNotebookNote",
  JWT.verifyTokenMiddleware(),
  requireUid,
  NotesBookController.deleteNotebookNote,
);

module.exports = NotesBookRouter;
