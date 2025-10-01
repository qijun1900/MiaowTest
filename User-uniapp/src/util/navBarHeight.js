// 导航栏高度获取工具
const navBarHeightUtil = {
    /**
     * 获取导航栏高度信息
     * @returns {Object} 包含状态栏高度、导航栏高度和总高度的对象
     */
    getNavBarInfo: () => {
        // 获取系统信息
        const sysInfo = uni.getWindowInfo();//获取系统信息
        const statusBarHeight = sysInfo.statusBarHeight || 0;//获取状态栏高度，确保不为undefined
        const defaultNavBarHeight = 44; // 默认导航栏高度

        let navBarHeight = defaultNavBarHeight;// 导航栏高度
        let totalHeight = statusBarHeight + defaultNavBarHeight;// 状态栏高度 + 导航栏高度
        
        let menuButtonRect = null;// 胶囊布局位置信息
        
        // #ifndef APP || H5
        // 判断获取微信小程序胶囊API是否可用 H5出现为true情况无法使用
        if (uni.canIUse('getMenuButtonBoundingClientRect')) {
            try {
                // 获取微信小程序胶囊布局位置信息
                menuButtonRect = uni.getMenuButtonBoundingClientRect();
                if (menuButtonRect && menuButtonRect.top && menuButtonRect.height) {
                    // (胶囊上部高度-状态栏高度)*2 + 胶囊高度 = 导航栏高度（不包含状态栏）
                    // 以此保证胶囊位于中间位置，多机型适配
                    navBarHeight = (menuButtonRect.top - statusBarHeight) * 2 + menuButtonRect.height;
                    // 确保导航栏高度不小于最小值
                    navBarHeight = Math.max(navBarHeight, defaultNavBarHeight);
                    // 状态栏高度 + 导航栏高度 = 自定义导航栏高度总和
                    totalHeight = statusBarHeight + navBarHeight;
                }
            } catch (error) {
                console.warn('获取胶囊信息失败，使用默认高度:', error);
                // 发生错误时使用默认值
                navBarHeight = defaultNavBarHeight;
                totalHeight = statusBarHeight + defaultNavBarHeight;
            }
        }
        // #endif
        
        // 针对不同平台进行特殊处理
        // #ifdef APP-PLUS
        // APP端可能需要额外的处理
        const platform = sysInfo.platform;
        if (platform === 'ios') {
            // iOS设备特殊处理
            totalHeight = Math.max(totalHeight, statusBarHeight + 44);
        } else if (platform === 'android') {
            // Android设备特殊处理
            totalHeight = Math.max(totalHeight, statusBarHeight + 50);
        }
        // #endif
        
        // #ifdef H5
        // H5端使用固定高度
        navBarHeight = defaultNavBarHeight;
        totalHeight = statusBarHeight + defaultNavBarHeight;
        // #endif
        
        return {
            statusBarHeight,// 状态栏高度
            navBarHeight,// 导航栏高度（不包含状态栏）
            totalHeight,//  状态栏高度 + 导航栏高度
            menuButtonRect// 胶囊布局位置信息
        };
    },
    
    /**
     * 获取安全区域信息
     * @returns {Object} 安全区域信息
     */
    getSafeAreaInfo: () => {
        const sysInfo = uni.getWindowInfo();
        return {
            top: sysInfo.safeAreaInsets?.top || sysInfo.statusBarHeight || 0,// 顶部安全区域距离
            bottom: sysInfo.safeAreaInsets?.bottom || 0,// 底部安全区域距离
            left: sysInfo.safeAreaInsets?.left || 0,// 左侧安全区域距离
            right: sysInfo.safeAreaInsets?.right || 0// 右侧安全区域距离
        };
    }
    
}

export default navBarHeightUtil