import escconfig from '../config/esc.config';
const baseURl = `http://${escconfig.serverHost}:${escconfig.serverPort}`
import { UserInfoStore } from '../stores/modules/UserinfoStore';


// 统一的HTTP请求封装
// 适用于uni-app的http请求封装，支持小程序和H5平台
// 支持拦截器，支持Promise化
// 支持自动添加baseURL，支持自动添加token，支持自动添加客户端标识，支持自动添加平台标识
// 支持自动处理错误，支持自动处理超时，支持自动处理网络错误，支持自动处理401错误


// 检测当前运行环境
const getPlatform = () => {
    try {
        const systemInfo = uni.getSystemInfoSync();
        if (systemInfo.uniPlatform === 'web') {
            return 'h5';
        } else if (systemInfo.uniPlatform === 'mp-weixin') {
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
    return new Promise((resolve, reject) => {
        uni.request({
            ...options,
            success(res) {
                //状态码2xx，直接返回结果数据
                if(res.statusCode >=200 && res.statusCode < 300){
                    resolve(res.data)//返回数据
                }else if(res.statusCode === 401){
                    //token过期，需要重新登录
                    //清理本地token和用户信息
                    uni.removeStorageSync('token');
                    
                    //清理用户信息
                    const userInfoStore = UserInfoStore();
                    userInfoStore.clearUserInfo();
                    
                    //跳转登录页
                    uni.navigateTo({url: '/pages/my/my'});
                    reject('登录过期，请重新登录',res)
                } else{
                    uni.showToast({
                        title: res.data.message || '请求错误',//显示错误信息
                        icon: 'none',//显示错误图标
                        mask: true//防止用户连续点击按钮
                    })
                }
            },
            fail(err) {
                uni.showToast({
                    title: '网络异常，请稍后重试',//显示错误信息
                    icon: 'none',//显示错误图标
                    mask: true//防止用户连续点击按钮
                })
                reject(err)
            }
        })
    })

}