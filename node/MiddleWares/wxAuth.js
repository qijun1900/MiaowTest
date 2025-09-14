const axios = require('axios');

/**
 * 获取微信用户信息的辅助函数
 * @param {string} code - 微信登录凭证
 * @returns {Promise<Object>} - 包含openid, session_key, unionid的对象
 */
const wxAuth = async (code) => {
    const wxApiUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    const wxResponse = await axios.get(wxApiUrl, {
        params: {
            appid: process.env.WECHAT_APPID,
            secret: process.env.WECHAT_SECRET,
            js_code: code,
            grant_type: 'authorization_code'
        },
        timeout: 10000 // 10秒超时
    });

    if (wxResponse.data.errcode) {
        throw new Error(`微信API错误: ${wxResponse.data.errmsg}`);
    }
    
    const { openid, session_key, unionid } = wxResponse.data;
    return { openid, session_key };
};

module.exports = {
    wxAuth
};