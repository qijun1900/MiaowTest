/**
 * 知识库前端 API 模块
 * 封装所有知识库相关的 HTTP 请求，遵循项目约定：
 * - POST 请求检查 response.data.ActionType === "OK"
 * - GET 请求检查 response.data.code === 200
 * - 文件上传使用 upload() 工具（FormData multipart）
 */
import axios from "axios";
import upload from "@/util/upload";

// ==================== 知识库 CRUD ====================

/** 创建知识库 */
export async function postAddKnowledgeBase(name, description, creator) {
  try {
    const response = await axios.post("/adminapi/knowledge-base/add", {
      name,
      description,
      creator,
    });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postAddKnowledgeBase error:", error);
    throw error;
  }
}

/** 获取知识库列表（含每个知识库的文档数量） */
export async function getKnowledgeBaseList() {
  try {
    const response = await axios.get("/adminapi/knowledge-base/list");
    if (response.data.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("getKnowledgeBaseList error:", error);
    throw error;
  }
}

/** 更新知识库名称和描述 */
export async function postUpdateKnowledgeBase(_id, name, description) {
  try {
    const response = await axios.post("/adminapi/knowledge-base/update", { _id, name, description });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postUpdateKnowledgeBase error:", error);
    throw error;
  }
}

/** 删除知识库（同步清理所有关联的向量和文档） */
export async function postDeleteKnowledgeBase(_id) {
  try {
    const response = await axios.post("/adminapi/knowledge-base/delete", { _id });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postDeleteKnowledgeBase error:", error);
    throw error;
  }
}

// ==================== 文档 CRUD ====================

/**
 * 上传文档
 * data 需包含 { title, file: File, knowledgeBaseIds: JSON字符串, creator }
 * 因为 FormData 不支持数组，knowledgeBaseIds 需要 JSON.stringify 后传入
 */
export async function postAddKnowledgeDoc(data) {
  try {
    const response = await upload("/adminapi/knowledge/add", data);
    if (response.ActionType === "OK") {
      return response;
    }
    return null;
  } catch (error) {
    console.error("postAddKnowledgeDoc error:", error);
    throw error;
  }
}

/** 分页获取文档列表，支持 keyword 模糊搜索和 knowledgeBaseId 筛选 */
export async function getKnowledgeDocList(params) {
  try {
    const response = await axios.get("/adminapi/knowledge/list", {
      params: {
        page: params?.page || 1,
        size: params?.size || 20,
        ...params,
      },
    });
    if (response.data.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("getKnowledgeDocList error:", error);
    throw error;
  }
}

/** 触发文档处理（LlamaParse 解析 → 向量化入库） */
export async function postProcessKnowledgeDoc(_id) {
  try {
    const response = await axios.post("/adminapi/knowledge/process", { _id });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postProcessKnowledgeDoc error:", error);
    throw error;
  }
}

/** 完全删除文档（清理向量 + OSS 文件 + MongoDB 记录） */
export async function postDeleteKnowledgeDoc(_id) {
  try {
    const response = await axios.post("/adminapi/knowledge/delete", { _id });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postDeleteKnowledgeDoc error:", error);
    throw error;
  }
}

/**
 * RAG 检索增强问答
 * @param {string} question - 用户问题
 * @param {number} topK - 检索文档数量
 * @param {string} modelName - LLM 模型名称
 * @param {string} knowledgeBaseId - 指定知识库 ID（可选，不传则使用默认 collection）
 * @returns {{ answer: string, sources: Array<{content, metadata, score}> }}
 */
export async function postRAGQuery(question, topK, modelName, knowledgeBaseId) {
  try {
    const response = await axios.post("/adminapi/knowledge/rag", {
      question,
      topK,
      modelName,
      knowledgeBaseId,
    });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postRAGQuery error:", error);
    throw error;
  }
}

// ==================== 文档-知识库关联 ====================

/** 将已有文档添加到新知识库（重新解析并入库到新 collection） */
export async function postAddDocToKnowledgeBase(docId, kbId) {
  try {
    const response = await axios.post("/adminapi/knowledge/add-to-kb", { docId, kbId });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postAddDocToKnowledgeBase error:", error);
    throw error;
  }
}

/** 从指定知识库移除文档（仅清理该 collection 的向量，不删除文档本身） */
export async function postRemoveDocFromKnowledgeBase(docId, kbId) {
  try {
    const response = await axios.post("/adminapi/knowledge/remove-from-kb", { docId, kbId });
    if (response.data.ActionType === "OK") {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("postRemoveDocFromKnowledgeBase error:", error);
    throw error;
  }
}
