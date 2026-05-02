import { ref, watch } from "vue";
import { onShow, onHide } from "@dcloudio/uni-app";

/**
 * 封装 TabBar 自动隐藏与显示逻辑
 * @param {Ref<number>} keyboardHeight 键盘高度的响应式引用，用于在键盘弹起时锁定 TabBar
 */
export function useAutoTabBar(keyboardHeight) {
    let tabBarHideTimer = null;
    const isTabBarVisible = ref(true);

    const hideTabBar = () => {
        uni.hideTabBar({ animation: true });
        isTabBarVisible.value = false;
    };

    const showTabBar = () => {
        // 键盘显示期间不允许唤出 TabBar，防止跟随键盘上弹
        if (keyboardHeight && keyboardHeight.value > 0) return;
        
        uni.showTabBar({ animation: true });
        isTabBarVisible.value = true;
        resetTabBarTimer();
    };

    const resetTabBarTimer = () => {
        if (tabBarHideTimer) clearTimeout(tabBarHideTimer);
        tabBarHideTimer = setTimeout(() => {
            hideTabBar();
        }, 2500); // 无操作 2.5 秒后自动隐藏 TabBar
    };

    // 小程序/APP 生命周期：进入页面第一时间隐藏 TabBar
    onShow(() => {
        hideTabBar();
    });

    onHide(() => {
        if (tabBarHideTimer) clearTimeout(tabBarHideTimer);
    });

    // 用户上下滑动内容时，唤出 TabBar
    const handleScroll = () => {
        // 取消在 scroll 事件中自动唤出 TabBar。
        // 因为当 TabBar 隐藏/显示时，页面可视区域发生变化，
        // 会触发 scroll-view 的重新计算和细微滚动（引发假 scroll 事件），
        // 从而导致不断的“显示 -> 隐藏 -> 触发scroll -> 显示”的无限死循环弹跳。
        // 用户的操作已经由 handleTouchStart 捕获并显示 TabBar 了，这里无需再做处理。
    };

    // 用户轻滑或点按页面时，唤出 TabBar 或顺延隐藏时间
    const handleTouchStart = () => {
        if (!keyboardHeight || keyboardHeight.value === 0) {
            showTabBar(); // showTabBar 内部自带了显示逻辑和定时器重置
        }
    };

    // 键盘弹起时立刻隐藏，且收起时不再默认恢复
    if (keyboardHeight) {
        watch(keyboardHeight, (newVal) => {
            if (newVal > 0) {
                hideTabBar();
            }
        });
    }

    const handleSenderFocus = () => {
        hideTabBar();
    };

    const handleSenderBlur = () => {
        // 失去焦点时不主动恢复，靠用户滑动唤出
    };

    return {
        isTabBarVisible, // 当前 TabBar 可见状态，供页面组件根据需要调整布局（如底部安全区高度）
        hideTabBar, // 供外部手动调用（如全屏预览时）
        showTabBar, // 供外部手动调用（如全屏预览时）
        handleScroll, // 监听内容区滚动以自动隐藏 TabBar
        handleTouchStart, // 监听内容区滚动以自动显示 TabBar
        handleSenderFocus,// 监听输入区 focus 以自动隐藏 TabBar
        handleSenderBlur,// 监听输入区 blur 以自动显示 TabBar
    };
}
