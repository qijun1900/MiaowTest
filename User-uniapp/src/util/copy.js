const handleCopy = (text) => {
    // 使用 uni-app 的剪贴板 API
    uni.setClipboardData({
        data: text,
        success: function () {
            uni.showToast({
                title: '复制成功',
                icon: 'success'
            });
        },
        fail: function (err) {
            console.error('复制失败', err);
            uni.showToast({
                title: '复制失败',
                icon: 'none'
            });
        }
    });
};

export default handleCopy;