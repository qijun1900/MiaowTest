import { showSuccess, showError } from "./showMessage";

const handleCopy = (text) => {
    // #ifdef MP-WEIXIN
    wx.setClipboardData({
        data: text,
    });
    // #endif

    // #ifdef H5
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
            () => showSuccess("复制成功"),
            (err) => {
                console.error("复制失败", err);
                showError("复制失败");
            },
        );
    } else {
        fallbackCopy(text);
    }
    // #endif

    // #ifdef APP-PLUS
    uni.setClipboardData({
        data: text,
        showToast: false,
        success: function () {
            showSuccess("复制成功");
        },
        fail: function (err) {
            console.error("复制失败", err);
            showError("复制失败");
        },
    });
    // #endif
};

// H5 降级方案
function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        showSuccess("复制成功");
    } catch (err) {
        console.error("复制失败", err);
        showError("复制失败");
    }
    document.body.removeChild(textarea);
}

export default handleCopy;
