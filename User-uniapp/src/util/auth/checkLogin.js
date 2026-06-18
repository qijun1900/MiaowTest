import showModal from '../ui/modal';

/**
 * 本地检测用户是否登录，并且跳转到登录页面。
 */
export default async function checkLogin(content) {
    try {
        const token = uni.getStorageSync('token');

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
            return false;
        }
        return true;
    } catch (error) {
        console.error('登录检查出错:', error);
        return false;
    }
}
