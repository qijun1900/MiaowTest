/**
 * 构建更新弹窗 HTML
 */
function buildDialogHTML(options) {
    const cancelBtn = options.showCancel !== false
        ? '<div id="btn-cancel" class="btn-cancel">' + (options.cancelText || '取消') + '</div>'
        : '';
    return '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
        '<style>' +
        '* { margin:0; padding:0; box-sizing:border-box; }' +
        'html,body { width:100%; height:100%; overflow:hidden; }' +
        'body { display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }' +
        '.dialog { width:300px; max-height:80vh; background:#fff; border-radius:12px; overflow:hidden; padding:24px 20px 16px; display:flex; flex-direction:column; }' +
        '.title { font-size:17px; font-weight:bold; color:#1a1a1a; text-align:center; margin-bottom:12px; flex-shrink:0; }' +
        '.content { font-size:14px; color:#666; line-height:1.6; white-space:pre-wrap; word-break:break-all; margin-bottom:20px; overflow-y:auto; flex:1; }' +
        '.actions { display:flex; gap:12px; flex-shrink:0; }' +
        '.btn-cancel,.btn-confirm { flex:1; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px; font-size:15px; user-select:none; -webkit-tap-highlight-color:transparent; cursor:pointer; touch-action:manipulation; }' +
        '.btn-cancel { background:#f5f5f5; color:#999; }' +
        '.btn-confirm { background:linear-gradient(135deg,#4d94ff,#357ae0); color:#fff; font-weight:bold; }' +
        '.btn-cancel:active,.btn-confirm:active { opacity:0.75; transform:scale(0.97); }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="dialog">' +
        '<div class="title">' + (options.title || '') + '</div>' +
        '<div class="content">' + (options.content || '').replace(/\n/g, '<br>') + '</div>' +
        '<div class="actions">' +
        cancelBtn +
        '<div id="btn-confirm" class="btn-confirm">' + (options.confirmText || '确定') + '</div>' +
        '</div></div>' +
        '<scr' + 'ipt>' +
        '(function(){' +
        'function submit(choice){plus.storage.setItem("__updateDialogResult",choice);plus.webview.currentWebview().close();}' +
        'var c=document.getElementById("btn-confirm");' +
        'c.addEventListener("touchend",function(e){e.preventDefault();submit("confirm");});' +
        'c.addEventListener("click",function(e){e.preventDefault();submit("confirm");});' +
        'var b=document.getElementById("btn-cancel");' +
        'if(b){b.addEventListener("touchend",function(e){e.preventDefault();submit("cancel");});b.addEventListener("click",function(e){e.preventDefault();submit("cancel");});}' +
        '})();' +
        '</scr' + 'ipt>' +
        '</body></html>';
}

let dialogWV = null;

/**
 * 显示更新弹窗（非原生，使用 plus.webview 覆盖层）
 * @param {Object} options
 * @returns {Promise<{confirm: boolean}>}
 */
export function showUpdateDialog(options) {
    return new Promise((resolve) => {
        plus.storage.removeItem('__updateDialogResult');

        const html = buildDialogHTML(options);

        dialogWV = plus.webview.create('', 'updateDialog', {
            background: 'transparent',
            popGesture: 'none',
            zindex: 19999,
        });

        dialogWV.addEventListener('close', () => {
            const result = plus.storage.getItem('__updateDialogResult');
            console.log("[updateDialogState] dialog关闭, result:", result);
            plus.storage.removeItem('__updateDialogResult');
            dialogWV = null;
            resolve({ confirm: result === 'confirm' });
        });

        dialogWV.loadData(html);
        dialogWV.show('fade-in', 200);
    });
}
