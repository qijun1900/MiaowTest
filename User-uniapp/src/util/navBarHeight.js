// 导航栏高度获取工具
const navBarHeightUtil = {
    /**
     * 获取导航栏高度信息
     * @returns {Object} 包含状态栏高度、导航栏高度和总高度的对象
     */
    getNavBarInfo: () => {
        // 获取系统信息
        const sysInfo = uni.getWindowInfo();//获取系统信息
        const statusBarHeight = sysInfo.statusBarHeight;//获取状态栏高度
        const defaultNavBarHeight = 44; // 默认导航栏高度

        let navBarHeight = defaultNavBarHeight;// 导航栏高度
        let totalHeight = statusBarHeight + defaultNavBarHeight;// 状态栏高度 + 导航栏高度
        
        let menuButtonRect = null;// 胶囊布局位置信息
        
        // #ifndef APP || H5
        // 判断获取微信小程序胶囊API是否可用 H5出现为true情况无法使用
        if (uni.canIUse('getMenuButtonBoundingClientRect')) {
            // 获取微信小程序胶囊布局位置信息
            menuButtonRect = uni.getMenuButtonBoundingClientRect();
            // (胶囊上部高度-状态栏高度)*2 + 胶囊高度 = 导航栏高度（不包含状态栏）
            // 以此保证胶囊位于中间位置，多机型适配
            navBarHeight = (menuButtonRect.top - sysInfo.statusBarHeight) * 2 + menuButtonRect.height;
            // 状态栏高度 + 导航栏高度 = 自定义导航栏高度总和
            totalHeight = statusBarHeight + navBarHeight;
        }
        // #endif
        
        return {
            statusBarHeight,// 状态栏高度
            navBarHeight,// 导航栏高度
            totalHeight,//  状态栏高度 + 导航栏高度
            menuButtonRect// 胶囊布局位置信息
        };
    },
    
}

export default navBarHeightUtil