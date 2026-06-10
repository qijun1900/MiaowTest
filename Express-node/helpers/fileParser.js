/**
 * 文件解析助手：将用户上传的 docx / pdf / txt 等附件 URL 拉回服务器后
 * 提取纯文本，供 LLM 作为上下文使用。
 *
 * 注意：
 *  · 仅支持文本类文档；图片/视频/音频等不在本模块处理。
 *  · 为防止超长文档撑爆 LLM 上下文，对每个文件做字符上限截断。
 *  · 解析失败不抛错，返回错误占位串，保证对话主链路不被附件问题中断。
 */

const path = require("path");

/**
 * 字符上限说明（针对 qwen-plus/max 128k context 调优）：
 *  · 中文 1 字 ≈ 1 token，英文 4 字 ≈ 1 token，按中文最坏估算
 *  · 留出系统提示 + 历史消息 + 输出空间约 30k tokens
 *  · 单文件 80k 字符 ≈ 60k tokens，单轮合计 100k 字符 ≈ 80k tokens
 *  · 支持通过环境变量覆盖，便于按模型调整
 */
const PER_FILE_CHAR_LIMIT = Number(process.env.LLM_FILE_CHAR_LIMIT) || 80000;
const TOTAL_CHAR_LIMIT = Number(process.env.LLM_TOTAL_CHAR_LIMIT) || 100000;

/** 根据 URL/文件名推断文件类型 */
function inferFileExt(input) {
  const name = String(input || "").toLowerCase().split("?")[0];
  const ext = path.extname(name).replace(".", "");
  return ext || "";
}

const FETCH_TIMEOUT_MS = Number(process.env.LLM_FILE_FETCH_TIMEOUT) || 30000;
const MAX_DOWNLOAD_BYTES = Number(process.env.LLM_FILE_MAX_BYTES) || 50 * 1024 * 1024; // 50 MB

/** 拉取远程文件为 Buffer，带超时和大小保护 */
async function fetchBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`下载文件失败 status=${res.status}`);
    }
    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength && contentLength > MAX_DOWNLOAD_BYTES) {
      throw new Error(`文件过大 ${(contentLength / 1024 / 1024).toFixed(1)}MB，超过 ${MAX_DOWNLOAD_BYTES / 1024 / 1024}MB 上限`);
    }
    const arrBuf = await res.arrayBuffer();
    if (arrBuf.byteLength > MAX_DOWNLOAD_BYTES) {
      throw new Error(`文件过大 ${(arrBuf.byteLength / 1024 / 1024).toFixed(1)}MB，超过上限`);
    }
    return Buffer.from(arrBuf);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`下载文件超时（${FETCH_TIMEOUT_MS / 1000}s）`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 文本规范化：压缩多余空白行和重复空格，节省 token 占用。
 * PDF/DOCX 提取出来常带大量空行，能压掉 20%~40% 字符。
 */
function normalizeText(text) {
  if (!text) return "";
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")     // 行尾空白
    .replace(/\n{3,}/g, "\n\n")     // 连续空行压成 1 个
    .replace(/[ \t]{2,}/g, " ")     // 多空格压成 1 个
    .trim();
}

/** 文本截断（保留头部，超长在末尾追加省略提示） */
function truncate(text, limit = PER_FILE_CHAR_LIMIT) {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit) + `\n\n[...文件过长，已截断，剩余 ${text.length - limit} 字符未展示]`;
}

const TEXT_PARSER = async (buf) => buf.toString("utf8");

const PARSERS = {
  txt: TEXT_PARSER,
  md: TEXT_PARSER,
  markdown: TEXT_PARSER,
  log: TEXT_PARSER,
  json: TEXT_PARSER,
  csv: TEXT_PARSER,
  tsv: TEXT_PARSER,
  xml: TEXT_PARSER,
  html: TEXT_PARSER,
  htm: TEXT_PARSER,
  yaml: TEXT_PARSER,
  yml: TEXT_PARSER,
  ini: TEXT_PARSER,
  conf: TEXT_PARSER,
  js: TEXT_PARSER,
  ts: TEXT_PARSER,
  jsx: TEXT_PARSER,
  tsx: TEXT_PARSER,
  py: TEXT_PARSER,
  java: TEXT_PARSER,
  go: TEXT_PARSER,
  rs: TEXT_PARSER,
  c: TEXT_PARSER,
  cpp: TEXT_PARSER,
  h: TEXT_PARSER,
  sql: TEXT_PARSER,
  sh: TEXT_PARSER,
  docx: async (buf) => {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return result?.value || "";
  },
  pdf: async (buf) => {
    const pdfModule = require("pdf-parse");
    if (typeof pdfModule === "function") {
      const result = await pdfModule(buf);
      return result?.text || "";
    }
    if (typeof pdfModule.PDFParse === "function") {
      const parser = new pdfModule.PDFParse({ data: buf });
      const result = await parser.getText();
      await parser.destroy?.();
      return result?.text || "";
    }
    throw new Error("pdf-parse 模块导出格式不支持");
  },
  xlsx: async (buf) => {
    const XLSX = require("xlsx");
    const wb = XLSX.read(buf, { type: "buffer" });
    const parts = [];
    for (const sheetName of wb.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
      if (csv && csv.trim()) parts.push(`## Sheet: ${sheetName}\n${csv}`);
    }
    return parts.join("\n\n");
  },
  xls: async (buf) => PARSERS.xlsx(buf),
};

/**
 * 解析单个文件 URL，返回 { name, ext, text, error? }
 */
async function parseOneFile(fileLike) {
  const url = typeof fileLike === "string" ? fileLike : fileLike?.url;
  const presetName = typeof fileLike === "object" ? fileLike?.name : "";
  if (!url) return { name: presetName || "", ext: "", text: "", error: "缺少 URL" };

  const ext = inferFileExt(presetName || url);
  const name = presetName || path.basename(url.split("?")[0]) || `file.${ext || "bin"}`;
  const parser = PARSERS[ext];

  if (!parser) {
    return { name, ext, text: "", error: `不支持的文件类型 .${ext}` };
  }

  try {
    const buf = await fetchBuffer(url);
    const raw = await parser(buf);
    const normalized = normalizeText(raw);
    const text = truncate(normalized);
    console.log(`[fileParser] ${name} 原始 ${String(raw || "").length} → 规范化 ${normalized.length} → 截断 ${text.length}`);
    return { name, ext, text };
  } catch (err) {
    console.warn(`[fileParser] 解析失败 ${name}:`, err.message);
    return { name, ext, text: "", error: err.message || "解析失败" };
  }
}

/**
 * 批量解析文件，返回一段拼好的 Markdown 文本，可直接拼到 user input 前部。
 * 例如：
 *   [附件] 报告.docx
 *   <文档正文>
 *   ---
 *   [附件] 数据.txt
 *   <文档正文>
 *
 * @param {Array<string|{url:string, name?:string}>} files
 * @returns {Promise<{block: string, parsed: Array, errors: Array}>}
 */
async function buildAttachmentContext(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return { block: "", parsed: [], errors: [] };
  }

  const results = await Promise.all(files.map(parseOneFile));

  const sections = [];
  const errors = [];
  let totalChars = 0;

  for (const r of results) {
    if (r.error) {
      errors.push({ name: r.name, error: r.error });
      sections.push(`【附件】${r.name}\n[无法解析：${r.error}]`);
      continue;
    }
    const remaining = TOTAL_CHAR_LIMIT - totalChars;
    if (remaining <= 0) {
      sections.push(`【附件】${r.name}\n[已达到附件文本总量上限，未读取此文件]`);
      continue;
    }
    const text = r.text.length > remaining
      ? r.text.slice(0, remaining) + "\n[...超出总量上限，截断]"
      : r.text;
    totalChars += text.length;
    sections.push(`【附件】${r.name}\n${text || "[文件为空]"}`);
  }

  const block = sections.length
    ? `以下是用户随消息附带的文件内容，请结合这些内容回答：\n\n${sections.join("\n\n---\n\n")}\n\n`
    : "";

  return { block, parsed: results, errors };
}

module.exports = {
  buildAttachmentContext,
  parseOneFile,
  inferFileExt,
};
