/**
 * 多模态内容构建工具
 *
 * 处理用户消息中图片与文本的混合场景，构建符合 LangChain / OpenAI 多模态格式的
 * content 数组（[{type: "text", text}, {type: "image_url", image_url: {url}}]）。
 *
 * 当消息不含图片时，直接返回纯文本字符串，避免不必要的数组包装。
 */

/**
 * 构建用户消息内容：纯文本或含图片的多模态内容数组。
 *
 * 图片 URL 格式校验：仅接受常见图片格式（jpg/jpeg/png/gif/webp/bmp/svg），
 * 非图片 URL 会被静默跳过（如 PDF 链接不应作为 image_url 传给视觉模型）。
 * 直接使用原始 URL，由 DashScope 视觉模型侧自行下载。
 *
 * @param {string} text - 用户输入的文本内容
 * @param {Array<string|{url: string}>} [images] - 图片 URL 数组，支持字符串或对象格式
 * @returns {string|Array} 纯文本时返回 string，含图片时返回多模态 content 数组
 */
function buildUserContent(text, images) {
  if (!images || images.length === 0) return text || "";

  const parts = [];
  if (text) parts.push({ type: "text", text });

  for (const img of images) {
    const url = typeof img === "string" ? img : img?.url;
    if (url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url)) {
      parts.push({ type: "image_url", image_url: { url } });
    }
  }

  if (parts.length === 0) return text || "";
  // 仅含纯文本时退化为 string，减少下游分支
  return parts.length === 1 && parts[0].type === "text" ? text : parts;
}

module.exports = {
  buildUserContent,
};
