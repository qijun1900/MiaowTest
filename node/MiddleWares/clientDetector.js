// 客户端检测中间件
const clientDetector = (req, res, next) => {
    // 从请求头中获取客户端信息
    const sourceClient = req.headers['source-client'];
    const platform = req.headers['platform'];
    // const token = req.headers["authorization"].split(" ")[1]
    // console.log("MYToken",token)//打印token
    
    // 将客户端信息添加到请求对象中，供后续中间件和控制器使用
    req.clientInfo = {
        sourceClient: sourceClient || 'unknown', // 'web' 或 'miniapp'
        platform: platform || 'unknown',       // 'h5' 或 'miniapp'
        isWeb: sourceClient === 'web',          // 用于判断是否为Web端请求
        isMiniApp: sourceClient === 'miniapp',      // 用于判断是否为小程序请求
        isH5: platform === 'h5'                  // 用于判断是否为H5平台请求
    };
    
    // 记录请求来源（用于统计分析）
    const displaySource = sourceClient || 'Admin';
    const displayPlatform = platform || 'Background management';
    console.log(`[${new Date().toISOString()}] Request from ${displaySource} (${displayPlatform})`);
    
    next();
};

module.exports = clientDetector;