import { cloudFileToHttpUrl } from "./cloudFileUrl";

const DEFAULT_PREVIEW_EMPTY_HTML =
  '<p style="color:#98a2b6;margin:0 0 12px;">开始记录...</p><p style="color:#98a2b6;margin:0;">当前为富文本编辑模式，支持标题、列表、颜色等样式。</p>';

export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeToHtml = (value = "") => {
  const content = String(value || "");
  if (!content.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  return `<p>${escapeHtml(content).replace(/\n/g, "<br/>")}</p>`;
};

export const normalizeCloudImageSrcInHtml = (value = "") => {
  const content = String(value || "");
  if (!content || !content.includes("cloud://")) {
    return content;
  }

  return content.replace(
    /(<img\b[^>]*\bsrc\s*=\s*)(["'])(cloud:\/\/[^"']+)(\2)/gi,
    (fullMatch, prefix, quote, source) => {
      const resolved = cloudFileToHttpUrl(source);
      if (resolved === source) {
        return fullMatch;
      }
      return `${prefix}${quote}${resolved}${quote}`;
    },
  );
};

export const buildNotePreviewHtml = ({
  title = "",
  content = "",
  emptyHtml = DEFAULT_PREVIEW_EMPTY_HTML,
} = {}) => {
  const safeTitle = String(title || "").trim();
  const safeContent = String(content || "").trim();
  const body = normalizeCloudImageSrcInHtml(safeContent || emptyHtml);

  const titleHtml = safeTitle
    ? `<h2 style="font-size:22px;line-height:1.4;color:#3d4456;margin:0 0 12px;">${escapeHtml(safeTitle)}</h2>`
    : "";

  return `${titleHtml}${body}`;
};
