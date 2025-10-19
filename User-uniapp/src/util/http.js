import escconfig from '../config/esc.config';
const baseURl = escconfig.useTunnel 
    ? escconfig.tunnelUrl 
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;

// 云托管请求封装
function cloudRequest(options) {
    return new Promise((resolve, reject) => {
        if (!wx.cloud) {
            reject(new Error('请在微信小程序环境下使用云托管API'));
            return;
        }
        wx.cloud.callContainer({
            config: {
                env: escconfig.cloudEnv
            },
            path: options.url,
            header: {
                'X-WX-SERVICE': escconfig.cloudService,
                ...options.header
            },
            method: options.method || 'GET',
            data: options.data || {},
            success: res => {
                // 兼容原有 resolve 行为
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
import { UserInfoStore } from '../stores/modules/UserinfoStore';

// 统一的HTTP请求封装
// 适用于uni-app的http请求封装，支持小程序和H5平台
// 支持拦截器，支持Promise化
// 支持自动添加baseURL，支持自动添加token，支持自动添加客户端标识，支持自动添加平台标识
// 支持自动处理错误，支持自动处理超时，支持自动处理网络错误，支持自动处理401错误

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
            options.header.Authorization = `Bearer ${token}`; // 添加Bearer前缀
        }
    }
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

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