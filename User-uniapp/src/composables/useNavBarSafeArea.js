import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import navBarHeightUtil from "../util/navBarHeight";

// 导航栏基础兜底值：在系统信息尚未获取前，先保证页面可渲染
const createDefaultNavBarInfo = () => ({
  statusBarHeight: 0,
  navBarHeight: 44,
  totalHeight: 44,
  menuButtonRect: null,
});

// 安全区基础兜底值：避免首次渲染出现 undefined
const createDefaultSafeAreaInfo = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

/**
 * 自定义导航栏与安全区适配 composable
 *
 * @param {{
 *  reserveMenuButtonRight?: boolean,
 *  rightPaddingExtra?: number,
 * }} options
 * @returns {{
 *  navBarInfo: import("vue").Ref<{
 *    statusBarHeight: number,
 *    navBarHeight: number,
 *    totalHeight: number,
 *    menuButtonRect: any,
 *  }>,
 *  safeAreaInfo: import("vue").Ref<{
 *    top: number,
 *    bottom: number,
 *    left: number,
 *    right: number,
 *  }>,
 *  refreshLayoutInfo: () => void,
 *  customNavbarStyle: import("vue").ComputedRef<Record<string, string>>,
 *  navRowStyle: import("vue").ComputedRef<Record<string, string>>,
 * }}
 */
export function useNavBarSafeArea(options = {}) {
  const {
    reserveMenuButtonRight = false,
    rightPaddingExtra = 8,
  } = options;

  const navBarInfo = ref(createDefaultNavBarInfo());
  const safeAreaInfo = ref(createDefaultSafeAreaInfo());

  // 主动刷新一次系统布局信息：用于首屏和横竖屏等场景复用
  const refreshLayoutInfo = () => {
    navBarInfo.value = navBarHeightUtil.getNavBarInfo();
    safeAreaInfo.value = navBarHeightUtil.getSafeAreaInfo();
  };

  // 自定义导航栏外层样式：总高度=状态栏+导航栏，按需预留胶囊按钮右侧空间
  const customNavbarStyle = computed(() => {
    const style = {
      height: `${navBarInfo.value.totalHeight}px`,
      paddingTop: `${navBarInfo.value.statusBarHeight}px`,
    };

    // 不需要避让胶囊时直接返回基础样式
    if (!reserveMenuButtonRight) {
      return style;
    }

    const menuRect = navBarInfo.value.menuButtonRect;
    // 非小程序或无法获取胶囊信息时，退回基础样式
    if (!menuRect || !menuRect.left) {
      return style;
    }

    const hasGetWindowInfo =
      typeof uni !== "undefined" && typeof uni.getWindowInfo === "function";
    const windowWidth = hasGetWindowInfo
      ? Number(uni.getWindowInfo().windowWidth || 0)
      : 0;
    const rightReserve = Math.max(
      windowWidth - Number(menuRect.left || 0) + Number(rightPaddingExtra || 0),
      0,
    );

    style.paddingRight = `${rightReserve}px`;
    return style;
  });

  // 自定义导航栏内容区高度（不含状态栏）
  const navRowStyle = computed(() => ({
    height: `${navBarInfo.value.navBarHeight}px`,
  }));

  // 初始化并在页面回显时自动刷新，减少页面重复调用代码
  refreshLayoutInfo();
  onShow(() => {
    refreshLayoutInfo();
  });

  return {
    navBarInfo,
    safeAreaInfo,
    refreshLayoutInfo,
    customNavbarStyle,
    navRowStyle,
  };
}
