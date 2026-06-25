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
 */
const express = require("express");
const KnowledgeController = require("../../controllers/admin/KnowledgeController");
const KnowledgeRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

// ==================== 知识库 CRUD ====================
KnowledgeRouter.post("/adminapi/knowledge-base/add", KnowledgeController.createKnowledgeBase);
KnowledgeRouter.post("/adminapi/knowledge-base/update", KnowledgeController.updateKnowledgeBase);
KnowledgeRouter.get("/adminapi/knowledge-base/list", KnowledgeController.getKnowledgeBaseList);
KnowledgeRouter.post("/adminapi/knowledge-base/delete", KnowledgeController.deleteKnowledgeBase);

// ==================== 文档 CRUD ====================
// upload.single("file"): multer 解析 multipart 文件到 req.file
// uploadToOSS("knowledge"): 将文件上传到阿里云 OSS，注入 req.file.ossUrl
KnowledgeRouter.post(
  "/adminapi/knowledge/add",
  upload.single("file"),
  uploadToOSS("knowledge"),
  KnowledgeController.addDocument,
);

KnowledgeRouter.post("/adminapi/knowledge/process", KnowledgeController.processDocument);
KnowledgeRouter.get("/adminapi/knowledge/list", KnowledgeController.getDocumentList);
KnowledgeRouter.post("/adminapi/knowledge/delete", KnowledgeController.deleteDocument);

// 文档-知识库关联管理
KnowledgeRouter.post("/adminapi/knowledge/add-to-kb", KnowledgeController.addDocToKnowledgeBase);
KnowledgeRouter.post("/adminapi/knowledge/remove-from-kb", KnowledgeController.removeDocFromKnowledgeBase);

// ==================== RAG 问答 ====================
KnowledgeRouter.post("/adminapi/knowledge/rag", KnowledgeController.ragQuery);

module.exports = KnowledgeRouter;
