// 阿里云 OSS 工具类（上传，流式上传，删除 OSS 上的文件，获取 OSS 文件的访问 URL，遍历）
const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
const ossConfig = require('../config/oss.config');

// 初始化 OSS 客户端
const client = new OSS(ossConfig);

/**
 * 上传文件到 OSS
 * @param {string} localFilePath - 本地文件路径
 * @param {string} ossFilePath - OSS 文件路径（相对于存储桶）
 * @returns {Promise<string>} - 文件访问 URL
 */
async function uploadFile(localFilePath, ossFilePath) {
    try {
        // 添加存储前缀
        const fullOssPath = ossConfig.prefix + ossFilePath;
        
        // 上传文件
        const result = await client.put(fullOssPath, localFilePath); //fullOssPath 是上传到 OSS 中的路径，localFilePath 是本地文件的路径
        
        // 生成文件访问 URL
        let fileUrl;
        if (ossConfig.cdnDomain) {
            // 使用 CDN 域名
            fileUrl = `https://${ossConfig.cdnDomain}/${fullOssPath}`;
        } else {
            // 使用 OSS 原始域名
            fileUrl = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${fullOssPath}`;
        }
        
        return fileUrl;
    } catch (error) {
        console.error('OSS 上传文件失败:', error);
        throw error;
    }
}

/**
 * 流式上传文件到 OSS
 * @param {ReadStream} stream - 文件流
 * @param {string} ossFilePath - OSS 文件路径（相对于存储桶）
 * @returns {Promise<string>} - 文件访问 URL
 */
async function uploadStream(stream, ossFilePath) {
    try {
        // 添加存储前缀
        const fullOssPath = ossConfig.prefix + ossFilePath;
        
        // 上传文件流
        const result = await client.putStream(fullOssPath, stream);
        
        // 生成文件访问 URL
        let fileUrl;
        if (ossConfig.cdnDomain) {
            // 使用 CDN 域名
            fileUrl = `https://${ossConfig.cdnDomain}/${fullOssPath}`;
        } else {
            // 使用 OSS 原始域名
            fileUrl = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${fullOssPath}`;
        }
        
        return fileUrl;
    } catch (error) {
        console.error('OSS 流式上传文件失败:', error);
        throw error;
    }
}

/**
 * 删除 OSS 上的文件
 * @param {string} ossFilePath - OSS 文件路径（相对于存储桶）
 * @returns {Promise<boolean>}
 */
async function deleteFile(ossFilePath) {
    try {
        // 添加存储前缀
        const fullOssPath = ossConfig.prefix + ossFilePath;
        
        // 删除文件
        await client.delete(fullOssPath);
        return true;
    } catch (error) {
        console.error('OSS 删除文件失败:', error);
        throw error;
    }
}

/**
 * 通过 URL 删除 OSS 文件
 * @param {string} fileUrl - 文件完整 URL
 * @returns {Promise<boolean>}
 */
async function deleteFileByUrl(fileUrl) {
    try {
        // 移除 CDN 域名或 OSS 域名前缀，提取路径
        let ossPath = fileUrl;
        
        // 如果是 CDN 域名
        if (ossConfig.cdnDomain) {
            const cdnHost = `https://${ossConfig.cdnDomain}/`;
            if (ossPath.startsWith(cdnHost)) {
                ossPath = ossPath.replace(cdnHost, '');
            }
        }
        
        // 如果是 OSS 原始域名
        if (!ossPath.includes(ossConfig.prefix)) {
            const ossHost = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/`;
            if (ossPath.startsWith(ossHost)) {
                ossPath = ossPath.replace(ossHost, '');
            }
        }
        
        // 移除存储前缀
        if (ossConfig.prefix && ossPath.startsWith(ossConfig.prefix)) {
            ossPath = ossPath.replace(ossConfig.prefix, '');
        }

        const result = await deleteFile(ossPath);
        
        return result;
    } catch (error) {
        console.error('OSS 通过 URL 删除文件失败:', error);
        throw error;
    }
}

/**
 * 获取 OSS 文件的访问 URL
 * @param {string} ossFilePath - OSS 文件路径（相对于存储桶）
 * @returns {string} - 文件访问 URL
 */
function getFileUrl(ossFilePath) {
    // 添加存储前缀
    const fullOssPath = ossConfig.prefix + ossFilePath;
    
    if (ossConfig.cdnDomain) {
        // 使用 CDN 域名
        return `https://${ossConfig.cdnDomain}/${fullOssPath}`;
    } else {
        // 使用 OSS 原始域名
        return `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${fullOssPath}`;
    }
}

/**
 * 递归遍历目录，获取所有文件路径
 * @param {string} dirPath - 目录路径
 * @returns {Array<string>} - 文件路径数组
 */
function getAllFiles(dirPath) {
    const files = [];
    
    function traverse(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        items.forEach(item => {
            const itemPath = path.join(currentPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                traverse(itemPath);
            } else {
                files.push(itemPath);
            }
        });
    }
    
    traverse(dirPath);
    return files;
}

/**
 * 迁移本地目录到 OSS
 * @param {string} localDir - 本地目录路径
 * @param {string} ossDir - OSS 目录路径（相对于存储桶）
 * @returns {Promise<Array<{localPath: string, ossPath: string, url: string}>>} - 迁移结果数组
 */
async function migrateDirToOSS(localDir, ossDir) {
    try {
        const files = getAllFiles(localDir);
        const migrateResults = [];
        
        for (const localFilePath of files) {
            // 计算相对于本地目录的路径
            const relativePath = path.relative(localDir, localFilePath);
            // 构建 OSS 文件路径
            const ossFilePath = path.posix.join(ossDir, relativePath).replace(/\\/g, '/');
            
            // 上传文件到 OSS
            const url = await uploadFile(localFilePath, ossFilePath);
            
            migrateResults.push({
                localPath: localFilePath,
                ossPath: ossFilePath,
                url: url
            });
            
            console.log(`迁移成功: ${localFilePath} -> ${ossFilePath}`);
        }
        
        return migrateResults;
    } catch (error) {
        console.error('迁移目录到 OSS 失败:', error);
        throw error;
    }
}

module.exports = {
    uploadFile,
    uploadStream,
    deleteFile,
    deleteFileByUrl,
    getFileUrl,
    migrateDirToOSS
};
