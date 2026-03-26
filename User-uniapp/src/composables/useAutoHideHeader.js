import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

/**
 * 固定头部自动隐藏 composable
 *
 * 规则：
 *  1. 刚进入页面（onShow）→ 显示头部，不启动计时器，等用户真正滚动后再决定
 *  2. 滚动到顶部（scrollTop <= 0）→ 显示头部，取消计时器，永不隐藏
 *  3. 向下滚动（scrollTop > 0）→ 显示头部，delay ms 无操作后自动隐藏
 *
 * ⚠️  onPageScroll 必须在页面的 <script setup> 中直接注册，不能放在 composable 里：
 *     uni-app 编译小程序时会静态分析 <script setup> 来注入 Page({onPageScroll})，
 *     写在 composable 内部编译器追踪不到，导致小程序端永远不触发。
 *     用法示例：
 *       const { isHeaderVisible, handlePageScroll } = useAutoHideHeader(3000);
 *       onPageScroll(handlePageScroll);   // ← 必须写在页面 <script setup> 里
 *
 * 动画约定（在调用方 CSS 中实现）：
 *  - 头部使用 position: sticky，避免 fixed + 布局位移触发虚假 onPageScroll
 *  - 绑定 :class="{ 'header-hidden': !isHeaderVisible }"
 *  - .header-hidden { transform: translateY(-100%); opacity: 0; pointer-events: none; }
 *  - .fixed-header { transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ... }
 *
 * @param {number} delay - scrollTop > 0 时，多少毫秒无操作后隐藏，默认 3000
 * @returns {{
 *   isHeaderVisible: import('vue').Ref<boolean>,
 *   handlePageScroll: (payload: { scrollTop: number }) => void,
 *   showHeader: () => void,
 *   hideHeader: () => void,
 * }}
 */
export function useAutoHideHeader(delay = 3000) {
  const isHeaderVisible = ref(true);
  let hideTimer = null;

  /** 清除当前计时器 */
  const clearTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  /**
   * 显示头部并取消计时器
   * 适用场景：进入页面、滚回顶部 —— 此时头部应始终可见，不触发自动隐藏
   */
  const showAndKeep = () => {
    clearTimer();
    isHeaderVisible.value = true;
  };

  /**
   * 显示头部并启动自动隐藏计时器
   * 适用场景：用户在列表中段滚动 —— 停止滚动 delay ms 后隐藏头部
   */
  const showAndScheduleHide = () => {
    isHeaderVisible.value = true;
    clearTimer();
    hideTimer = setTimeout(() => {
      isHeaderVisible.value = false;
    }, delay);
  };

  /**
   * 立即隐藏头部并清除计时器（供外部手动调用，如全屏预览时）
   */
  const hideHeader = () => {
    clearTimer();
    isHeaderVisible.value = false;
  };

  /**
   * 页面 onPageScroll 的处理函数
   * ⚠️ 必须在页面 <script setup> 中通过 onPageScroll(handlePageScroll) 注册，
   *    不在此处内部注册，以保证小程序编译期静态分析能正确注入 Page({onPageScroll})
   *
   * @param {{ scrollTop: number }} payload
   */
  const handlePageScroll = ({ scrollTop }) => {
    if (scrollTop <= 0) {
      // 回到顶部 → 始终显示，不自动隐藏
      showAndKeep();
    } else {
      // 向下滚动 → 显示并开始倒计时
      showAndScheduleHide();
    }
  };

  // 每次页面进入前台：显示头部但不启动计时器
  // 等用户真正开始向下滚动后，才进入"可隐藏"状态
  // onShow 写在 composable 内部，小程序编译期可正常识别（页面级 onShow 无静态注入限制）
  onShow(() => {
    showAndKeep();
  });

  return {
    isHeaderVisible,
    handlePageScroll, // 交给页面直接传给 onPageScroll()
    showHeader: showAndKeep, // 强制显示并保持（不计时），如退出全屏时调用
    hideHeader, // 强制隐藏
  };
}
