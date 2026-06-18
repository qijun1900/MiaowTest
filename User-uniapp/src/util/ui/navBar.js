// 导航栏高度获取工具
const navBarHeightUtil = {
    getNavBarInfo: () => {
        const sysInfo = uni.getWindowInfo();
        const statusBarHeight = sysInfo.statusBarHeight || 0;
        const defaultNavBarHeight = 44;

        let navBarHeight = defaultNavBarHeight;
        let totalHeight = statusBarHeight + defaultNavBarHeight;

        let menuButtonRect = null;

        // #ifdef MP
        if (uni.canIUse('getMenuButtonBoundingClientRect')) {
            try {
                menuButtonRect = uni.getMenuButtonBoundingClientRect();
                if (menuButtonRect && menuButtonRect.top && menuButtonRect.height) {
                    navBarHeight = (menuButtonRect.top - statusBarHeight) * 2 + menuButtonRect.height;
                    navBarHeight = Math.max(navBarHeight, defaultNavBarHeight);
                    totalHeight = statusBarHeight + navBarHeight;
                }
            } catch (error) {
                console.warn('获取胶囊信息失败，使用默认高度:', error);
                navBarHeight = defaultNavBarHeight;
                totalHeight = statusBarHeight + defaultNavBarHeight;
            }
        }
        // #endif

        // #ifdef APP-PLUS
        const platform = sysInfo.platform;
        if (platform === 'ios') {
            totalHeight = Math.max(totalHeight, statusBarHeight + 44);
        } else if (platform === 'android') {
            totalHeight = Math.max(totalHeight, statusBarHeight + 50);
        }
        // #endif

        // #ifdef H5
        navBarHeight = defaultNavBarHeight;
        totalHeight = statusBarHeight + defaultNavBarHeight;
        // #endif

        return {
            statusBarHeight,
            navBarHeight,
            totalHeight,
            menuButtonRect
        };
    },

    getSafeAreaInfo: () => {
        const sysInfo = uni.getWindowInfo();
        return {
            top: sysInfo.safeAreaInsets?.top || sysInfo.statusBarHeight || 0,
            bottom: sysInfo.safeAreaInsets?.bottom || 0,
            left: sysInfo.safeAreaInsets?.left || 0,
            right: sysInfo.safeAreaInsets?.right || 0
        };
    }
};

export default navBarHeightUtil;
