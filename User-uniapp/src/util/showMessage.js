import Message from "@tdesign/uniapp/message/index";

let _context = null;

export function setMessageInstance(context) {
    _context = context;
}

function show(content, theme = "info", duration = 3000) {
    if (!_context) return;
    Message[theme]({
        context: _context,
        offset: ["180rpx", "32rpx"],
        duration,
        content,
        icon: true,
    });
}

export function showSuccess(content, duration = 2000) {
    show(content, "success", duration);
}

export function showError(content, duration = 3000) {
    show(content, "error", duration);
}

export function showWarning(content, duration = 3000) {
    show(content, "warning", duration);
}

export function showInfo(content, duration = 3000) {
    show(content, "info", duration);
}
