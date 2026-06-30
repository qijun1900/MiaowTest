/**
 * LLM 错误分类与处理工具
 *
 * 用于识别 DashScope / OpenAI 兼容接口返回的特定错误类型，
 * 并提供统一的友好错误消息。适用于所有 LLM 调用链。
 */

/** DashScope 内容安全拦截的友好提示 */
const CONTENT_MODERATION_REPLY = "抱歉，您发送的内容触发了平台内容安全审核，请更换图片或修改文字后重试。";

/** 图片下载失败的友好提示 */
const IMAGE_DOWNLOAD_FAIL_REPLY = "抱歉，图片处理失败，请重新上传图片后再试。";

/**
 * 检测是否为 DashScope 内容审核错误。
 * DashScope 在检测到敏感内容时返回 DataInspectionFailed 或 inappropriate content。
 *
 * @param {Error} error - 捕获的异常对象
 * @returns {boolean}
 */
function isContentModerationError(error) {
  const msg = error?.message || error?.toString() || "";
  return msg.includes("DataInspectionFailed") || msg.includes("inappropriate content");
}

/**
 * 检测是否为多模态图片下载失败错误。
 * 当模型尝试下载用户提供的图片 URL 失败时触发。
 *
 * @param {Error} error - 捕获的异常对象
 * @returns {boolean}
 */
function isImageDownloadError(error) {
  const msg = error?.message || error?.toString() || "";
  return msg.includes("Failed to download multimodal content");
}

/**
 * 统一处理 LLM 调用链中的已知错误类型。
 * 返回友好的错误消息字符串；若非已知类型则返回 null，由调用方继续抛出。
 *
 * @param {Error} error - 捕获的异常对象
 * @returns {string|null} 友好错误消息，或 null（表示未知错误）
 */
function handleChainError(error) {
  if (isContentModerationError(error)) return CONTENT_MODERATION_REPLY;
  if (isImageDownloadError(error)) return IMAGE_DOWNLOAD_FAIL_REPLY;
  return null;
}

module.exports = {
  CONTENT_MODERATION_REPLY,
  IMAGE_DOWNLOAD_FAIL_REPLY,
  isContentModerationError,
  isImageDownloadError,
  handleChainError,
};
