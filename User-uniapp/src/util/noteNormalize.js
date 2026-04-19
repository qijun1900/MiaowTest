import formatTime from "./formatTime";
import { normalizeToHtml, stripHtml } from "./notePreview";

export const IMAGE_NOTE_PLACEHOLDER = "[图片]";

export const normalizeSingleTag = (tag) => {
  if (typeof tag === "string") return tag.trim();
  if (typeof tag === "number") return String(tag).trim();

  if (tag && typeof tag === "object") {
    const maybeText = tag.text ?? tag.label ?? tag.name ?? tag.value;
    return typeof maybeText === "string"
      ? maybeText.trim()
      : String(maybeText || "").trim();
  }

  return "";
};

export const normalizeTagList = (list = []) => {
  const normalized = [];

  for (const item of Array.isArray(list) ? list : []) {
    const text = normalizeSingleTag(item);
    if (text && !normalized.includes(text)) {
      normalized.push(text);
    }
  }

  return normalized;
};

export const normalizeImageUrl = (value = "") => String(value || "").trim();

export const extractImageUrlsFromHtml = (html = "") => {
  const content = String(html || "");
  if (!content || !/<img\b/i.test(content)) {
    return [];
  }

  const result = [];
  content.replace(
    /<img\b[^>]*\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (fullMatch, quoted, doubleQuoted, singleQuoted, bare) => {
      const source = normalizeImageUrl(doubleQuoted || singleQuoted || bare || "");
      if (!source) return fullMatch;

      result.push(source);
      return fullMatch;
    },
  );

  return Array.from(new Set(result));
};

export const hasImageTag = (value = "") => /<img\b/i.test(String(value || ""));

export const normalizePreviewText = (value = "") =>
  stripHtml(String(value || "")).trim();

export const normalizeNoteListItem = (item = {}) => {
  const rawSummary = String(item.summary || "");
  const rawPlainText = String(item.plainText || "");
  const normalizedSummary = normalizePreviewText(rawSummary);
  const normalizedPlainText = normalizePreviewText(rawPlainText);
  const previewText =
    normalizedSummary ||
    normalizedPlainText ||
    (hasImageTag(rawSummary) ? IMAGE_NOTE_PLACEHOLDER : "");
  const updatedAt = Number(new Date(item.updatedAt).getTime()) || 0;

  return {
    id: String(item._id || ""),
    title: String(item.title || "未命名笔记"),
    preview: previewText || "暂无内容",
    dateText: formatTime.getRelativeTime(item.updatedAt),
    tags: normalizeTagList(item.tags || []),
    isPinned: Boolean(item.isPinned),
    updatedAt,
  };
};

export const normalizeNoteDetailData = (data = {}) => {
  const title = String(data.title || "").trim() || "未命名笔记";
  const content = normalizeToHtml(data.content || data.summary || data.plainText || "");
  const tags = normalizeTagList(data.tags || []);
  const timeValue =
    data.updatedAt || data.updated_at || data.createTime || data.createdAt;

  return {
    title,
    content,
    tags,
    dateText: timeValue ? formatTime.getRelativeTime(timeValue) : "刚刚更新",
  };
};
