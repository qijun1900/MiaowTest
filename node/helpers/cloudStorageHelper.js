/**
 * 微信云存储 - 服务端文件管理工具
 *
 * 通过微信开放 API 在服务端管理 cloud:// 格式的云存储文件，
 * 使 APP 端、管理后台等非小程序环境也能正确清理云存储资源。
 *
 * 接口文档：
 * - 获取 access_token: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-access-token/getAccessToken.html
 * - 批量删除文件: https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/upload-download.html
 */
const axios = require('axios');

const APPID = process.env.WECHAT_APPID;
const SECRET = process.env.WECHAT_SECRET;
const CLOUD_ENV = process.env.CLOUD_ENV;

// access_token 缓存（有效期 7200 秒，提前 5 分钟刷新）
let tokenCache = { token: null, expiresAt: 0 };

/**
 * 判断路径是否为微信云存储 fileID
 * @param {string} path - 文件路径
 * @returns {boolean}
 */
function isCloudFileId(path) {
    return typeof path === 'string' && path.startsWith('cloud://');
}

/**
 * 获取微信接口调用 access_token（带缓存）
 */
async function getAccessToken() {
    if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
        return tokenCache.token;
    }

    if (!APPID || !SECRET) {
        throw new Error('缺少 WECHAT_APPID 或 WECHAT_SECRET 环境变量');
    }

    const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
            grant_type: 'client_credential',
            appid: APPID,
            secret: SECRET
        }
    });

    if (res.data.errcode) {
        throw new Error(`获取 access_token 失败: ${res.data.errmsg} (${res.data.errcode})`);
    }

    tokenCache = {
        token: res.data.access_token,
        expiresAt: Date.now() + (res.data.expires_in - 300) * 1000
    };

    return tokenCache.token;
}

/**
 * 批量删除微信云存储文件（服务端）
 * @param {string[]} fileIdList - cloud:// 格式的文件 ID 列表
 * @returns {Promise<{delete_list: Array}>} 删除结果
 */
async function deleteCloudFiles(fileIdList) {
    if (!Array.isArray(fileIdList) || fileIdList.length === 0) {
        return { delete_list: [] };
    }

    if (!CLOUD_ENV) {
        console.warn('未配置 CLOUD_ENV 环境变量，跳过云存储文件删除:', fileIdList);
        return { delete_list: [] };
    }

    const accessToken = await getAccessToken();

    const res = await axios.post(
        `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${accessToken}`,
        {
            env: CLOUD_ENV,
            fileid_list: fileIdList
        }
    );

    if (res.data.errcode && res.data.errcode !== 0) {
        throw new Error(`删除云存储文件失败: ${res.data.errmsg} (${res.data.errcode})`);
    }

    console.log('服务端删除云存储文件成功:', fileIdList);
    return res.data;
}

module.exports = {
    isCloudFileId,
    deleteCloudFiles
};
