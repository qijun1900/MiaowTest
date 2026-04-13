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

export const buildNotePreviewHtml = ({
  title = "",
  content = "",
  emptyHtml = DEFAULT_PREVIEW_EMPTY_HTML,
} = {}) => {
  const safeTitle = String(title || "").trim();
  const safeContent = String(content || "").trim();
  const body = safeContent || emptyHtml;

  const titleHtml = safeTitle
    ? `<h2 style="font-size:22px;line-height:1.4;color:#3d4456;margin:0 0 12px;">${escapeHtml(safeTitle)}</h2>`
    : "";

  return `${titleHtml}${body}`;
};
