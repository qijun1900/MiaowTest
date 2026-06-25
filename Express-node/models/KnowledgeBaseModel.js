const mongoose = require("mongoose");

/**
 * 知识库模型
 * 每个知识库对应一个独立的 Chroma collection，用于隔离不同主题/科目的文档向量
 *
 * 字段说明：
 * - name           知识库名称（如"计算机网络"、"数据库原理"）
 * - description    知识库描述
 * - collectionName Chroma 中的 collection 名称（自动生成，唯一标识）
 * - creator        创建者用户名
 * - createTime     创建时间
 *
 * 注意：docCount 不在此模型中存储，而是在 listKnowledgeBases 时
 * 通过 MongoDB aggregate 动态计算，避免数据不一致
 */
const KnowledgeBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  collectionName: { type: String, required: true, unique: true },
  creator: String,
  createTime: { type: Date, default: Date.now },
});

const KnowledgeBaseModel = mongoose.model("knowledge_base", KnowledgeBaseSchema);

module.exports = KnowledgeBaseModel;
