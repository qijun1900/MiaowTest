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

const PER_FILE_CHAR_LIMIT = 12000; // 单文件最多取多少字符（≈ 6k token）
const TOTAL_CHAR_LIMIT = 30000;    // 单轮所有附件合计字符上限

/** 根据 URL/文件名推断文件类型 */
function inferFileExt(input) {
  const name = String(input || "").toLowerCase().split("?")[0];
  const ext = path.extname(name).replace(".", "");
  return ext || "";
}

/** 拉取远程文件为 Buffer */
async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`下载文件失败 status=${res.status}`);
  }
  const arrBuf = await res.arrayBuffer();
  return Buffer.from(arrBuf);
}

/** 文本截断（保留头部，超长在末尾追加省略提示） */
function truncate(text, limit = PER_FILE_CHAR_LIMIT) {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit) + `\n\n[...文件过长，已截断，剩余 ${text.length - limit} 字符未展示]`;
}

const PARSERS = {
  txt: async (buf) => buf.toString("utf8"),
  md: async (buf) => buf.toString("utf8"),
  log: async (buf) => buf.toString("utf8"),
  json: async (buf) => buf.toString("utf8"),
  csv: async (buf) => buf.toString("utf8"),
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
    const text = truncate(String(raw || "").trim());
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
