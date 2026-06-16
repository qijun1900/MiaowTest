import { ref, watch } from "vue";
import { onShow, onHide } from "@dcloudio/uni-app";

/**
 * 封装自定义 TabBar 自动隐藏与显示逻辑
 *
 * 与原生 TabBar 解耦，仅控制自定义 TabBar 的可见状态（isTabBarVisible），
 * 不再调用 uni.showTabBar / uni.hideTabBar，避免干扰原生 TabBar。
 *
 * @param {Ref<number>} keyboardHeight - 键盘高度的响应式引用，用于在键盘弹起时锁定 TabBar
 * @returns {Object} TabBar 控制方法和状态
 */
export function useAutoTabBar(keyboardHeight) {
    /** 自动隐藏定时器 */
    let tabBarHideTimer = null;

    /** 当前 TabBar 是否可见 */
    const isTabBarVisible = ref(true);

    /**
     * 隐藏 TabBar
     * 仅更新状态，不调用原生 API
     */
    const hideTabBar = () => {
        isTabBarVisible.value = false;
    };

    /**
     * 显示 TabBar
     * 键盘显示期间不允许唤出，防止跟随键盘上弹
     */
    const showTabBar = () => {
        if (keyboardHeight && keyboardHeight.value > 0) return;

        isTabBarVisible.value = true;
        resetTabBarTimer();
    };

    /**
     * 重置自动隐藏定时器
     * 无操作 2.5 秒后自动隐藏 TabBar
     */
    const resetTabBarTimer = () => {
        if (tabBarHideTimer) clearTimeout(tabBarHideTimer);
        tabBarHideTimer = setTimeout(() => {
            hideTabBar();
        }, 2500);
    };

    // 页面显示时隐藏 TabBar（进入页面先隐藏，等用户交互再显示）
    onShow(() => {
        hideTabBar();
    });

    // 页面隐藏时清除定时器，防止内存泄漏
    onHide(() => {
        if (tabBarHideTimer) clearTimeout(tabBarHideTimer);
    });

    /**
     * 滚动事件处理（暂不使用）
     * 取消在 scroll 事件中自动唤出 TabBar，避免无限死循环弹跳
     */
    const handleScroll = () => {};

    /**
     * 触摸事件处理
     * 用户轻滑或点按页面时，唤出 TabBar 或顺延隐藏时间
     */
    const handleTouchStart = () => {
        if (!keyboardHeight || keyboardHeight.value === 0) {
            showTabBar();
        }
    };

    // 监听键盘高度变化，键盘弹起时立刻隐藏 TabBar
    if (keyboardHeight) {
        watch(keyboardHeight, (newVal) => {
            if (newVal > 0) {
                hideTabBar();
            }
        });
    }

    /**
     * 输入框聚焦时隐藏 TabBar
     */
    const handleSenderFocus = () => {
        hideTabBar();
    };

    /**
     * 输入框失焦时不主动恢复，靠用户滑动唤出
     */
    const handleSenderBlur = () => {};

    return {
        /** 当前 TabBar 可见状态 */
        isTabBarVisible,
        /** 手动隐藏 TabBar */
        hideTabBar,
        /** 手动显示 TabBar */
        showTabBar,
        /** 监听内容区滚动 */
        handleScroll,
        /** 监听触摸事件以自动显示 TabBar */
        handleTouchStart,
        /** 监听输入区 focus 以自动隐藏 TabBar */
        handleSenderFocus,
        /** 监听输入区 blur */
        handleSenderBlur,
    };
}
