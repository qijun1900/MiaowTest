import { ref, computed } from "vue";

/**
 * 封装下拉刷新逻辑
 * @param {Object} options
 * @param {import('vue').Ref<boolean>} options.enabled - 是否允许下拉刷新
 * @param {Function} options.onRefresh - 刷新回调，需返回 Promise
 * @param {number} [options.threshold=80] - 触发刷新的下拉距离 (rpx)
 */
export function usePullToRefresh({ enabled, onRefresh, threshold = 80 }) {
    const isRefreshing = ref(false);
    let touchStartY = 0;

    const canRefresh = computed(() => enabled.value && !isRefreshing.value);

    const onTouchStart = (e) => {
        touchStartY = e.touches?.[0]?.clientY || 0;
    };

    const onTouchEnd = async (e) => {
        if (!canRefresh.value) return;
        const endY = e.changedTouches?.[0]?.clientY || 0;
        if (endY - touchStartY > threshold) {
            isRefreshing.value = true;
            try {
                await onRefresh();
                uni.showToast({ title: "已刷新", icon: "none", position: "top" });
            } catch {
                uni.showToast({ title: "刷新失败", icon: "none" });
            } finally {
                isRefreshing.value = false;
            }
        }
    };

    return {
        isRefreshing,
        pullTouchStart: onTouchStart,
        pullTouchEnd: onTouchEnd,
    };
}
