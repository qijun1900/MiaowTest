import axios from "axios";
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token")
    config.headers.Authorization = `Bearer ${token}`

    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    const { authorization } = response.headers;
    authorization && localStorage.setItem('token', authorization);
    return response;
}, function (error) {
    // 对响应错误做点什么
    const { status } = error.response;
    if (status === 401) {
        localStorage.removeItem('token')// 防止冲突而删除token
        window.location.href = '#/login';// 定向到登录界面
    }
    return Promise.reject(error);
});