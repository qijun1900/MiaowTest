/**
 * 知识库路由
 * 所有路由均在 adminAuth 中间件之后注册，需要 JWT 认证
 *
 * API 列表：
 *   知识库：
 *     POST /adminapi/knowledge-base/add      创建知识库
 *     GET  /adminapi/knowledge-base/list      知识库列表（含文档数量）
 *     POST /adminapi/knowledge-base/delete    删除知识库
 *
 *   文档：
 *     POST /adminapi/knowledge/add            上传文档（multer + OSS 中间件链）
 *     POST /adminapi/knowledge/process        触发文档处理（LlamaParse 解析→向量化）
 *     GET  /adminapi/knowledge/list            文档列表（支持按知识库筛选）
 *     POST /adminapi/knowledge/delete          删除文档（清理向量+OSS+记录）
 *     POST /adminapi/knowledge/add-to-kb       将已有文档添加到新知识库
 *     POST /adminapi/knowledge/remove-from-kb  从指定知识库移除文档
 *
 *   RAG：
 *     POST /adminapi/knowledge/rag            检索增强问答
 *
 *   调试工具：
 *     GET  /adminapi/knowledge/chunks         查看知识库中的 chunks（检查拆分效果）
 *     POST /adminapi/knowledge/test-retrieval 测试检索效果（返回相似度分数）
 *     GET  /adminapi/knowledge/vector-stats   向量库统计信息
 */
const express = require("express");
const KnowledgeController = require("../../controllers/admin/KnowledgeController");
const KnowledgeRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

// ==================== 知识库 CRUD ====================
/**
 * @swagger
 * /adminapi/knowledge-base/add:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 创建知识库
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 知识库名称
 *               description:
 *                 type: string
 *                 description: 知识库描述
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge-base/add", KnowledgeController.createKnowledgeBase);
/**
 * @swagger
 * /adminapi/knowledge-base/update:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 更新知识库
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 知识库ID
 *               name:
 *                 type: string
 *                 description: 知识库名称
 *               description:
 *                 type: string
 *                 description: 知识库描述
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge-base/update", KnowledgeController.updateKnowledgeBase);
/**
 * @swagger
 * /adminapi/knowledge-base/list:
 *   get:
 *     tags: [管理员-知识库]
 *     summary: 获取知识库列表（含文档数量）
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.get("/adminapi/knowledge-base/list", KnowledgeController.getKnowledgeBaseList);
/**
 * @swagger
 * /adminapi/knowledge-base/delete:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 删除知识库
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge-base/delete", KnowledgeController.deleteKnowledgeBase);

// ==================== 文档 CRUD ====================
/**
 * @swagger
 * /adminapi/knowledge/add:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 上传文档（multer + OSS 中间件链）
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
 *                 description: 上传的文档文件
 *               knowledgeBaseId:
 *                 type: string
 *                 description: 知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
// upload.single("file"): multer 解析 multipart 文件到 req.file
// uploadToOSS("knowledge"): 将文件上传到阿里云 OSS，注入 req.file.ossUrl
KnowledgeRouter.post(
  "/adminapi/knowledge/add",
  upload.single("file"),
  uploadToOSS("knowledge"),
  KnowledgeController.addDocument,
);

/**
 * @swagger
 * /adminapi/knowledge/process:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 触发文档处理（LlamaParse 解析并向量化）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 文档ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge/process", KnowledgeController.processDocument);
/**
 * @swagger
 * /adminapi/knowledge/doc/{id}:
 *   get:
 *     tags: [管理员-知识库]
 *     summary: 获取文档详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 文档ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.get("/adminapi/knowledge/doc/:id", KnowledgeController.getDocument);
/**
 * @swagger
 * /adminapi/knowledge/list:
 *   get:
 *     tags: [管理员-知识库]
 *     summary: 获取文档列表（支持按知识库筛选）
 *     parameters:
 *       - in: query
 *         name: knowledgeBaseId
 *         schema:
 *           type: string
 *         description: 知识库ID（可选筛选条件）
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.get("/adminapi/knowledge/list", KnowledgeController.getDocumentList);
/**
 * @swagger
 * /adminapi/knowledge/delete:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 删除文档（清理向量+OSS+记录）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 文档ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge/delete", KnowledgeController.deleteDocument);

// 文档-知识库关联管理
/**
 * @swagger
 * /adminapi/knowledge/add-to-kb:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 将已有文档添加到新知识库
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               docId:
 *                 type: string
 *                 description: 文档ID
 *               knowledgeBaseId:
 *                 type: string
 *                 description: 目标知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge/add-to-kb", KnowledgeController.addDocToKnowledgeBase);
/**
 * @swagger
 * /adminapi/knowledge/remove-from-kb:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 从指定知识库移除文档
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               docId:
 *                 type: string
 *                 description: 文档ID
 *               knowledgeBaseId:
 *                 type: string
 *                 description: 知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge/remove-from-kb", KnowledgeController.removeDocFromKnowledgeBase);

// ==================== 调试工具 ====================
/**
 * @swagger
 * /adminapi/knowledge/chunks:
 *   get:
 *     tags: [管理员-知识库]
 *     summary: 查看知识库中的 chunks（检查拆分效果）
 *     parameters:
 *       - in: query
 *         name: knowledgeBaseId
 *         schema:
 *           type: string
 *         description: 知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.get("/adminapi/knowledge/chunks", KnowledgeController.getChunks);
/**
 * @swagger
 * /adminapi/knowledge/test-retrieval:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 测试检索效果（返回相似度分数）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 检索查询文本
 *               knowledgeBaseId:
 *                 type: string
 *                 description: 知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge/test-retrieval", KnowledgeController.testRetrieval);
/**
 * @swagger
 * /adminapi/knowledge/vector-stats:
 *   get:
 *     tags: [管理员-知识库]
 *     summary: 获取向量库统计信息
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.get("/adminapi/knowledge/vector-stats", KnowledgeController.getVectorStats);

// ==================== RAG 问答 ====================
/**
 * @swagger
 * /adminapi/knowledge/rag:
 *   post:
 *     tags: [管理员-知识库]
 *     summary: 检索增强问答
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 用户提问
 *               knowledgeBaseId:
 *                 type: string
 *                 description: 知识库ID
 *     responses:
 *       200:
 *         description: 成功
 */
KnowledgeRouter.post("/adminapi/knowledge/rag", KnowledgeController.ragQuery);

module.exports = KnowledgeRouter;
