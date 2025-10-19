const axios = require('axios');

/**
 * ��ȡ΢���û���Ϣ�ĸ�������
 * @param {string} code - ΢�ŵ�¼ƾ֤
 * @returns {Promise<Object>} - ����openid, session_key, unionid�Ķ���
 * @description ʹ���Ƶ���ʱ����ʹ�� HTTP Э���Ի�ø��õ����ܣ���ȷ������ʹ�� HTTPS Э�飬��ο�����˵��
 * https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/guide/weixin/open.html#%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D
 */
const wxAuth = async (code) => {
    const wxApiUrl = 'http://api.weixin.qq.com/sns/jscode2session';
    const wxResponse = await axios.get(wxApiUrl, {
        params: {
            appid: process.env.WECHAT_APPID,
            secret: process.env.WECHAT_SECRET,
            js_code: code,
            grant_type: 'authorization_code'
        },
        timeout: 10000 // 10�볬ʱ
    });

    if (wxResponse.data.errcode) {
        throw new Error(`΢��API����: ${wxResponse.data.errmsg}`);
    }
    
    const { openid, session_key, unionid } = wxResponse.data;
    return { openid, session_key };
};

module.exports = {
    wxAuth
};