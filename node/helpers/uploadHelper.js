// 文件上传中间件，结合阿里云 OSS
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ossHelper = require('./ossHelper');

// 生成唯一文件名
function generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9) + ext;
}

// 创建临时存储目录
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// 配置 multer 临时存储，文件上传到本地临时目录，稍后上传到 OSS，然后删除临时文件
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, generateUniqueFilename(file.originalname));
    }
});

const upload = multer({ storage: storage }); 

/**
 * 处理文件上传到 OSS 的中间件
 * @param {string} ossDir - OSS 目录
 * @returns {Function} - Express 中间件
 */
function uploadToOSS(ossDir) {
    return async function (req, res, next) {
        try {
            if (req.file) {
                // 上传到 OSS
                const ossFilePath = `${ossDir}/${req.file.filename}`;
                const fileUrl = await ossHelper.uploadFile(req.file.path, ossFilePath); 
                
                // 将文件 URL 保存到 req.file
                req.file.ossUrl = fileUrl;
                req.file.ossPath = ossFilePath;
                
                // 删除临时文件
                fs.unlinkSync(req.file.path); // 删除临时文件
                
                // 保存相对路径（用于数据库存储）冗余代码，或者修改所有控制器来使用
                req.file.relativePath = `/${ossDir}/${req.file.filename}`;
            }
            
            next();
        } catch (error) {
            console.error('文件上传到 OSS 失败:', error);
            
            // 清理临时文件
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            res.status(500).send({
                code: '-1',
                error: '文件上传失败'
            });
        }
    };
}

module.exports = {
    upload,
    uploadToOSS
};
