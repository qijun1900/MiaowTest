/**
 * 将微信云存储 cloud:// fileID 转换为可通过 HTTP 访问的 URL
 *
 * cloud:// 格式仅在微信小程序中可用，App 端无法直接加载。
 * 转换为 tcb.qcloud.la 域名的 HTTP URL 后，所有端均可正常显示。
 *
 * @param {string} url - 图片 URL，可以是 cloud:// 格式或普通 HTTP URL
 * @returns {string} 可访问的 HTTP URL（非 cloud:// 格式原样返回）
 *
 * @example
 * // cloud://prod-xxx.7072-prod-xxx-1324721288/user/img.jpg
 * // => https://7072-prod-xxx-1324721288.tcb.qcloud.la/user/img.jpg
 */
export function cloudFileToHttpUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('cloud://')) {
    return url;
  }

  // cloud://{envId}.{cosId}/{filePath}
  const withoutProtocol = url.slice('cloud://'.length); // envId.cosId/filePath
  const firstSlash = withoutProtocol.indexOf('/');
  if (firstSlash === -1) return url;

  const hostPart = withoutProtocol.slice(0, firstSlash); // envId.cosId
  const filePath = withoutProtocol.slice(firstSlash + 1); // 文件路径

  const dotIndex = hostPart.indexOf('.');
  if (dotIndex === -1) return url;

  const cosId = hostPart.slice(dotIndex + 1); // 取 envId 后面的 cosId 部分

  return `https://${cosId}.tcb.qcloud.la/${filePath}`;
}
