import escconfig from '../config/esc.config';
import { UserInfoStore } from '../stores/modules/UserinfoStore';
const baseURl = escconfig.useTunnel 
    ? escconfig.tunnelUrl 
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;

// 统一的HTTP请求封装
// 适用于uni-app的http请求封装，支持小程序和H5平台
// 支持拦截器，支持Promise化
// 支持自动添加baseURL，支持自动添加token，支持自动添加客户端标识，支持自动添加平台标识
// 支持自动处理错误，支持自动处理超时，支持自动处理网络错误，支持自动处理401错误
//支持小程序云托管
//自动检测运行环境，支持H5和小程序

// 检测当前运行环境
const getPlatform = () => {
    try {
        // 使用 uni.getAppBaseInfo 替代 uni.getSystemInfoSync
        const appBaseInfo = uni.getAppBaseInfo();
        if (appBaseInfo.uniPlatform === 'web') {
            return 'h5';
        } else if (appBaseInfo.uniPlatform === 'mp-weixin') {
            return 'miniapp';
        }
        // 默认按小程序处理
        return 'miniapp';
    } catch (e) {
        // 如果获取系统信息失败，默认按小程序处理
        console.error('获取系统信息失败:', e);
        return 'miniapp';
    }
};

//添加拦截器
const httpInterceptor = {
    invoke(options) {
        //非http开头的，添加baseURL
        if (!options.url.startsWith('http')) {
            options.url = baseURl + options.url;
        }
        //超时设置，默认40s
        options.timeout = 40000;

        //根据平台添加不同的客户端标识
        const platform = getPlatform();//获取平台 h5/miniapp
        const clientHeader = platform === 'h5' ? 'web' : 'miniapp';

        options.header = {
            ...options.header,
            'source-client': clientHeader,//客户端来源 web/miniapp
            'platform': platform//平台 h5/miniapp
        }
        //添加token
        const token = uni.getStorageSync('token');//从本地获取token
        if (token) {
            options.header = {
                ...options.header,
                Authorization: `Bearer ${token}`
            };
        }
    }
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

// 云托管请求封装
function cloudRequest(options) {
    return new Promise((resolve, reject) => {
        if (!wx.cloud) {
            reject(new Error('请在微信小程序环境下使用云托管API'));
            return;
        }
        
        // 手动应用拦截器逻辑，因为uni.addInterceptor对wx.cloud.callContainer无效
        const processedOptions = { ...options };
        
        // 处理URL
        if (!processedOptions.url.startsWith('http')) {
            processedOptions.url = baseURl + processedOptions.url;
        }
        
        // 设置超时
        processedOptions.timeout = processedOptions.timeout ||15000; // 默认15秒
        
        // 添加平台标识
        const platform = getPlatform();
        const clientHeader = platform === 'h5' ? 'web' : 'miniapp';
        
        // 初始化header
        processedOptions.header = {
            ...processedOptions.header,
            'source-client': clientHeader,
            'platform': platform
        };
        
        // 添加token
        const token = uni.getStorageSync('token');
        if (token) {
            processedOptions.header.Authorization = `Bearer ${token}`;
        }
        
        // 构建最终的请求头
        const finalHeader = {
            'X-WX-SERVICE': escconfig.cloudService,
            ...processedOptions.header
        };
        
        wx.cloud.callContainer({
            config: {
                env: escconfig.cloudEnv
            },
            path: options.url, // 注意：path应该使用原始URL，而不是处理后的URL
            header: finalHeader,
            method: processedOptions.method || 'GET',
            data: processedOptions.data || {},
            success: res => {
                // 兼容原有 resolve 行为
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else if (res.statusCode === 401) {
                    // 处理401错误，清除token并跳转登录页
                    uni.removeStorageSync('token');
                    const userInfoStore = UserInfoStore();
                    userInfoStore.clearUserInfo();
                    uni.navigateTo({ url: '/pages/my/my' });
                    reject('登录过期，请重新登录', res);
                } else {
                    uni.showToast({
                        title: res.data.message || '请求错误',
                        icon: 'none',
                        mask: true
                    });
                    reject(res);
                }
            },
            fail: err => {
                uni.showToast({
                    title: '网络异常，请稍后重试',
                    icon: 'none',
                    mask: true
                });
                reject(err);
            }
        });
    });
}

export const http = (options) => {
    if (escconfig.useCloudContainer) {
        // 云托管请求
        return cloudRequest(options);
    } else {
        // 本地/隧道请求
        return new Promise((resolve, reject) => {
            uni.request({
                ...options,
                success(res) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data);
                    } else if (res.statusCode === 401) {
                        uni.removeStorageSync('token');
                        const userInfoStore = UserInfoStore();
                        userInfoStore.clearUserInfo();
                        uni.navigateTo({ url: '/pages/my/my' });
                        reject('登录过期，请重新登录', res);
                    } else {
                        uni.showToast({
                            title: res.data.message || '请求错误',
                            icon: 'none',
                            mask: true
                        });
                        reject(res);
                    }
                },
                fail(err) {
                    uni.showToast({
                        title: '网络异常，请稍后重试',
                        icon: 'none',
                        mask: true
                    });
                    reject(err);
                }
            });
        });
    }
}

/**
 * 读取本地文件为 base64（仅小程序环境）
 */
function readFileAsBase64(filePath) {
    return new Promise((resolve, reject) => {
        const fs = wx.getFileSystemManager();
        fs.readFile({
            filePath: filePath,
            encoding: 'base64',
            success: (res) => resolve(res.data),
            fail: (err) => reject(new Error('读取文件失败: ' + (err.errMsg || err)))
        });
    });
}

/**
 * 从文件路径提取扩展名
 */
function getFileExtension(filePath) {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
}

/**
 * 云托管 - 云对象存储上传
 * 使用 wx.cloud.uploadFile 上传文件到云托管对象存储
 */
function cloudUploadFile(filePath, cloudPath, onProgress) {
    return new Promise((resolve, reject) => {
        if (!wx.cloud) {
            reject(new Error('请在微信小程序环境下使用云托管上传'));
            return;
        }
        const task = wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            config: { env: escconfig.cloudEnv },
            success: res => resolve(res.fileID),
            fail: err => {
                const info = err.toString();
                reject(new Error(info.indexOf('abort') !== -1 ? '文件上传已中断' : '文件上传失败'));
            }
        });
        if (onProgress && task) {
            task.onProgressUpdate((res) => {
                if (onProgress(res) === false) task.abort();
            });
        }
    });
}

/**
 * 统一的文件上传方法 
 * 云托管模式下支持两种上传方式（由 useCloudStorage 配置控制）：
 *   1. 云托管云对象存储（useCloudStorage=true）：wx.cloud.uploadFile 上传到云存储，再 callContainer 通知后端记录 fileID
 *   2. base64 中转 OSS（useCloudStorage=false）：读取文件为 base64，通过 callContainer 发给后端，后端上传到 OSS
 * 普通模式：使用 uni.uploadFile 直接上传到后端
 * @param {object} options - 上传选项
 * @param {string} options.filePath - 本地文件路径
 * @param {string} options.url - 后端接口路径
 * @param {string} options.name - 文件字段名，默认 'file'
 * @param {string} options.cloudPath - 云存储路径（云对象存储模式下使用）
 * @param {object} options.formData - 额外的表单数据（可选）
 * @param {function} options.onProgress - 上传进度回调（云对象存储模式可用）
 * @returns {Promise<object>} 返回后端响应数据
 */
export const httpUpload = (options) => {
    if (escconfig.useCloudContainer) {
        if (escconfig.useCloudStorage) {
            // 方式1：云对象存储 — 先上传到云存储，再通知后端记录 fileID
            return cloudUploadFile(options.filePath, options.cloudPath, options.onProgress)
                .then(fileID => {
                    return cloudRequest({
                        url: options.url,
                        method: 'POST',
                        data: {
                            fileID: fileID,
                            ...options.formData
                        }
                    });
                });
        } else {
            // 方式2：base64 中转 OSS — 读取文件为 base64，通过 callContainer 发给后端上传到 OSS
            const ext = getFileExtension(options.filePath);
            return readFileAsBase64(options.filePath)
                .then(base64Data => {
                    return cloudRequest({
                        url: options.url,
                        method: 'POST',
                        data: {
                            base64Data: base64Data,
                            fileExt: ext,
                            ...options.formData
                        }
                    });
                });
        }
    } else {
        // 普通模式：直接使用 uni.uploadFile
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: options.url,
                filePath: options.filePath,
                name: options.name || 'file',
                fileType: 'image',
                formData: options.formData,
                success: (uploadRes) => {
                    try {
                        const data = JSON.parse(uploadRes.data);
                        resolve(data);
                    } catch (e) {
                        reject(new Error('解析响应失败'));
                    }
                },
                fail: (err) => {
                    uni.showToast({
                        title: '网络异常，请稍后重试',
                        icon: 'none',
                        mask: true
                    });
                    reject(err);
                }
            });
        });
    }
}