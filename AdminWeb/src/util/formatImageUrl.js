import escconfig from '@/config/esc.config';

/**
 * 格式化图片 URL
 * @param {string} url 图片路径
 * @returns {string} 完整的图片 URL
 */
const formatImageUrl = (url) => {
  if (!url) {
    return '';
  }
  
  // 如果是 blob URL，直接返回
  if (url.includes('blob')) {
    return url;
  }
  
  // 如果已经是完整的 HTTP/HTTPS URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果启用了 OSS 且配置了域名，使用 OSS 域名访问
  if (escconfig.oss.enabled && escconfig.oss.domain) {
    return `${escconfig.oss.domain}${url.startsWith('/') ? '' : '/'}${url}`;
  }else{
    // 否则使用服务器地址和端口访问
    return `http://${escconfig.serverHost}:${escconfig.serverPort}${url.startsWith('/')? '' : '/'}${url}`;
  }
};

export default formatImageUrl;