/**
 * LlamaParse 文档解析封装
 *
 * LlamaParse 是 LlamaIndex 提供的云端文档解析 API，擅长处理：
 * - 复杂表格（转为 Markdown 表格）
 * - 图片和图表（生成文字描述）
 * - 扫描件 PDF（内置 OCR）
 * - 多种格式：PDF、DOCX、PPTX、XLSX、图片等
 *
 * 工作流程：
 *   1. POST /upload 上传文件，返回 jobId
 *   2. GET /job/{id} 轮询等待解析完成（PENDING → SUCCESS/ERROR）
 *   3. GET /job/{id}/result/markdown 获取结构化 Markdown 结果
 *
 * API 文档：https://docs.cloud.llamaindex.ai/
 */
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const LLAMA_PARSE_API = "https://api.cloud.llamaindex.ai/api/parsing";

/**
 * 使用 LlamaParse 解析文档，返回结构化 Markdown
 *
 * @param {string} filePath - 本地文件路径（从 OSS 下载到临时目录后的路径）
 * @returns {Promise<string>} 解析后的 Markdown 文本
 * @throws {Error} 缺少 API Key、上传失败、解析失败、超时
 */
async function parseDocument(filePath) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("缺少 LLAMA_CLOUD_API_KEY 环境变量，请在 .env 中配置");
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  // Step 1: 上传文件并创建解析任务
  // language=zh 告知 LlamaParse 文档为中文，提升 OCR 和分词准确度
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const formData = new globalThis.FormData();
  formData.append("file", new Blob([fileBuffer]), fileName);

  let uploadRes;
  try {
    uploadRes = await axios({
      method: "post",
      url: `${LLAMA_PARSE_API}/upload?language=zh`,
      data: formData,
      headers,
      timeout: 120000,
    });
  } catch (err) {
    const status = err.response?.status;
    const body = err.response?.data;
    const detail = typeof body === "object" ? JSON.stringify(body) : body;
    throw new Error(`LlamaParse 上传失败 (HTTP ${status}): ${detail || err.message}`);
  }

  const jobId = uploadRes.data.id;
  if (!jobId) {
    throw new Error("LlamaParse 上传失败：未返回任务 ID");
  }

  // Step 2: 轮询等待解析完成
  await waitForCompletion(jobId, apiKey);

  // Step 3: 获取 Markdown 格式的解析结果
  const mdRes = await axios.get(
    `${LLAMA_PARSE_API}/job/${jobId}/result/markdown`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 60000,
    },
  );

  return mdRes.data.markdown || mdRes.data || "";
}

/**
 * 轮询等待 LlamaParse 任务完成
 * LlamaParse 是异步处理，大文件可能需要几分钟
 *
 * @param {string} jobId - 任务 ID
 * @param {string} apiKey - API Key
 * @param {number} [maxWaitMs=300000] - 最大等待时间（默认 5 分钟）
 * @returns {Promise<object>} 任务结果
 * @throws {Error} 解析失败或超时
 */
async function waitForCompletion(jobId, apiKey, maxWaitMs = 300000) {
  const startTime = Date.now();
  const pollInterval = 2000; // 每 2 秒查询一次

  while (Date.now() - startTime < maxWaitMs) {
    const statusRes = await axios.get(`${LLAMA_PARSE_API}/job/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });

    const status = statusRes.data.status;
    if (status === "SUCCESS") {
      return statusRes.data;
    }
    if (status === "ERROR") {
      throw new Error(
        `LlamaParse 解析失败: ${statusRes.data.error || "未知错误"}`,
      );
    }

    // 等待后继续轮询
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("LlamaParse 解析超时（超过 5 分钟）");
}

module.exports = { parseDocument };
