// 静态文件重定向中间件，将静态文件请求重定向到阿里云 OSS
const ossHelper = require('../helpers/ossHelper');

// 需要重定向的静态文件目录
const staticDirs = [
    '/avataruploads/',
    '/examcoveruploads/',
    '/newsuploads/',
    '/productuploads/',
    '/stylesheet/'
];

/**
 * 静态文件重定向中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件函数
 */
const ossStaticRedirect = (req, res, next) => {
    // 获取请求路径
    const reqPath = req.originalUrl;
    
    // 检查请求路径是否包含需要重定向的静态文件目录
    const isStaticFile = staticDirs.some(dir => reqPath.startsWith(dir));
    
    if (isStaticFile) {
        // 构建 OSS 文件路径（去除开头的 /）
        const ossFilePath = reqPath.substring(1);
        
        // 获取 OSS 文件 URL
        const ossUrl = ossHelper.getFileUrl(ossFilePath);
        
        // 重定向到 OSS URL
        res.redirect(ossUrl);
    } else {
        // 不是静态文件请求，继续处理
        next();
    }
};

module.exports = ossStaticRedirect;
