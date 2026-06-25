const mongoose = require("mongoose");

/**
 * 知识文档模型
 * 记录上传的文档元数据，文档可同时关联多个知识库（many-to-many）
 *
 * 字段说明：
 * - title            文档标题
 * - knowledgeBaseIds 关联的知识库 ID 数组（支持一个文档属于多个知识库）
 * - originalName     原始文件名
 * - fileUrl          阿里云 OSS 上的文件 URL
 * - fileType         文件扩展名（pdf、docx、txt 等）
 * - fileSize         文件大小（字节）
 * - status           处理状态：0=待处理 1=处理中 2=已完成 3=失败
 * - chunkCount       文本切分后的分块数量（处理完成后更新）
 * - errorMessage     处理失败时的错误信息
 * - creator          上传者用户名
 * - createTime       上传时间
 * - editTime         最后处理时间
 */
const KnowledgeDocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  knowledgeBaseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "knowledge_base" }],
  originalName: String,
  fileUrl: String,
  fileType: String,
  fileSize: Number,
  status: { type: Number, default: 0 },
  chunkCount: { type: Number, default: 0 },
  errorMessage: String,
  creator: String,
  createTime: { type: Date, default: Date.now },
  editTime: Date,
});

const KnowledgeDocModel = mongoose.model("knowledge_doc", KnowledgeDocSchema);

module.exports = KnowledgeDocModel;
