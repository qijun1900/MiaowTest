import showModal from './showModal.js';

/*
 * 本地检测用户是否登录，并且跳转到登录页面。
 * @param {string} content - 提示内容，用于显示给用户。
 * @returns {boolean} 如果用户已登录，则返回 true；否则返回 false。
*/
export default async function checkLogin(content) {
    try {
        const token = uni.getStorageSync('token');
        
        // 检查 token 是否存在
        if (!token) {
            const res = await showModal({
                title: '您未登录',
                content: content || '请先登录后再进行操作',
                showCancel: false
            });
            
            if (res.confirm) {
                uni.redirectTo({
                    url: '/pages/my/UserLoginView'
                });
            }
            return false; // 用户未登录，返回 false
        }
        return true; // 用户已登录，返回 true
    } catch (error) {
        console.error('登录检查出错:', error);
        // 出现错误时，为安全起见返回 false
        return false;
    }
}

