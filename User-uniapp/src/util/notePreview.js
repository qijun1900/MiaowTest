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

  return content.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const srcMatch = imgTag.match(
      /\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    if (!srcMatch) return imgTag;

    const source = String(srcMatch[2] || srcMatch[3] || srcMatch[4] || "");
    if (!source.startsWith("cloud://")) {
      return imgTag;
    }

    const resolved = cloudFileToHttpUrl(source);
    if (resolved === source) {
      return imgTag;
    }

    return imgTag.replace(srcMatch[0], `src="${resolved}"`);
  });
};

const PREVIEW_IMG_STYLE = {
  width: "100%",
  "max-width": "100%",
  height: "auto",
  display: "block",
};

const buildPreviewImgStyle = (styleValue = "") => {
  const styleMap = {};

  String(styleValue)
    .split(";")
    .forEach((item) => {
      const chunk = String(item || "").trim();
      if (!chunk) return;

      const separatorIndex = chunk.indexOf(":");
      if (separatorIndex < 0) return;

      const key = chunk.slice(0, separatorIndex).trim().toLowerCase();
      const value = chunk.slice(separatorIndex + 1).trim();
      if (!key || !value) return;

      styleMap[key] = value;
    });

  Object.assign(styleMap, PREVIEW_IMG_STYLE);

  return Object.entries(styleMap)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
};

export const normalizePreviewImageInHtml = (value = "") => {
  const content = String(value || "");
  if (!content || !/<img\b/i.test(content)) {
    return content;
  }

  return content.replace(/<img\b[^>]*>/gi, (imgTag) => {
    // 去除固定宽高属性，避免在 rich-text 预览时发生图片裁切。
    let nextTag = imgTag.replace(
      /\s(width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
      "",
    );

    const styleMatch = nextTag.match(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/i);
    const styleValue = String(styleMatch?.[2] || styleMatch?.[3] || "");
    const mergedStyle = buildPreviewImgStyle(styleValue);

    if (styleMatch) {
      nextTag = nextTag.replace(styleMatch[0], ` style="${mergedStyle}"`);
    } else {
      nextTag = nextTag.replace(/<img\b/i, `<img style="${mergedStyle}"`);
    }

    return nextTag;
  });
};

export const buildNotePreviewHtml = ({
  title = "",
  content = "",
  emptyHtml = DEFAULT_PREVIEW_EMPTY_HTML,
} = {}) => {
  const safeTitle = String(title || "").trim();
  const safeContent = String(content || "").trim();
  const body = normalizePreviewImageInHtml(
    normalizeCloudImageSrcInHtml(safeContent || emptyHtml),
  );

  const titleHtml = safeTitle
    ? `<h2 style="font-size:22px;line-height:1.4;color:#3d4456;margin:0 0 12px;">${escapeHtml(safeTitle)}</h2>`
    : "";

  return `${titleHtml}${body}`;
};
