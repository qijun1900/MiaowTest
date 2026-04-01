<template>
    <view v-if="show" class="cropper-overlay">
        <!-- 顶部栏 -->
        <view
            class="cropper-header"
            :style="{ paddingTop: statusBarHeight + 'px' }"
        >
            <text class="header-title">截取图片</text>
            <text class="header-hint">{{ headerHint }}</text>
        </view>

        <!-- 图片区域 -->
        <view
            class="cropper-body"
            id="cropperBody"
            @touchstart.prevent="onTouchStart"
            @touchmove.prevent="onTouchMove"
            @touchend.prevent="onTouchEnd"
        >
            <image
                :src="internalImagePath"
                class="source-image"
                mode="aspectFit"
                @load="onImageLoad"
            />

            <!-- 选区外的暗色遮罩 -->
            <template v-if="hasSelection">
                <view class="crop-mask" :style="topMaskStyle" />
                <view class="crop-mask" :style="bottomMaskStyle" />
                <view class="crop-mask" :style="leftMaskStyle" />
                <view class="crop-mask" :style="rightMaskStyle" />
                <!-- 选区边框 -->
                <view class="selection-border" :style="selectionBorderStyle">
                    <!-- 三分线 -->
                    <view class="grid-line grid-h1" />
                    <view class="grid-line grid-h2" />
                    <view class="grid-line grid-v1" />
                    <view class="grid-line grid-v2" />
                    <!-- 四角手柄 -->
                    <view class="corner tl" />
                    <view class="corner tr" />
                    <view class="corner bl" />
                    <view class="corner br" />
                    <!-- 边缘手柄 -->
                    <view class="edge-handle edge-t" />
                    <view class="edge-handle edge-b" />
                    <view class="edge-handle edge-l" />
                    <view class="edge-handle edge-r" />
                </view>
            </template>
            <template v-else>
                <view class="crop-mask full-mask" />
            </template>
        </view>

        <!-- 底部操作栏 -->
        <view class="cropper-footer">
            <view class="footer-btn" @click="handleCancel">
                <text class="btn-text cancel-text">取消</text>
            </view>
            <view class="footer-btn" @click="handleUseOriginal">
                <text class="btn-text btn-action-text">原图</text>
            </view>
            <view class="footer-btn" @click="handleRotate">
                <text class="btn-text btn-action-text">旋转</text>
            </view>
            <view
                class="footer-btn confirm-btn"
                :class="{ disabled: !hasSelection || cropping }"
                @click="handleConfirm"
            >
                <text class="btn-text confirm-text">{{
                    cropping ? "截取中..." : "确认截取"
                }}</text>
            </view>
        </view>

        <!-- 隐藏的canvas用于裁剪 -->
        <canvas
            canvas-id="cropCanvas"
            id="cropCanvas"
            class="hidden-canvas"
            :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        />
    </view>
</template>

<script setup>
import {
    ref,
    reactive,
    computed,
    nextTick,
    getCurrentInstance,
    watch,
} from "vue";

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    imagePath: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["confirm", "cancel", "useOriginal"]);

const instance = getCurrentInstance();

// 系统信息
const systemInfo = uni.getSystemInfoSync();
const statusBarHeight = systemInfo.statusBarHeight || 0;

// 原始图片尺寸
const originalWidth = ref(0);
const originalHeight = ref(0);

// 容器信息
const containerRect = reactive({ left: 0, top: 0, width: 0, height: 0 });

// 图片在容器内的实际显示区域（aspectFit模式下可能有留白）
const imageDisplay = reactive({ left: 0, top: 0, width: 0, height: 0 });

// 常量
const MIN_SIZE = 30; // 最小选区尺寸 px
const CORNER_SLOP = 20; // 四角触摸热区半径 px
const EDGE_SLOP = 14; // 边缘触摸热区半径 px

// 交互状态
const interactionMode = ref("none"); // 'none'|'drawing'|'moving'|'resize-tl'|'resize-tr'|'resize-bl'|'resize-br'|'resize-t'|'resize-b'|'resize-l'|'resize-r'
const dragStart = reactive({ x: 0, y: 0 });
const dragStartRect = reactive({ left: 0, top: 0, width: 0, height: 0 });
const selectionRect = reactive({ left: 0, top: 0, width: 0, height: 0 });
const hasSelection = ref(false);

// 动态提示文字
const headerHint = computed(() => {
    if (interactionMode.value === "drawing") return "松手完成选区";
    if (interactionMode.value === "moving") return "移动选区中...";
    if (interactionMode.value.startsWith("resize")) return "调整选区大小中...";
    return hasSelection.value
        ? "拖动调整选区，点击外部重新选择"
        : "拖动选择要截取的区域";
});

// Canvas 尺寸
const canvasWidth = ref(10);
const canvasHeight = ref(10);

// 裁剪中状态
const cropping = ref(false);

// 本地图片路径（用于 canvas 绘制，兼容远程URL）
const localImagePath = ref("");

// 内部管理的图片路径，支持旋转后更新
const internalImagePath = ref("");

// 旋转中状态
const rotating = ref(false);

// 当 show 变为 false 时重置状态
watch(
    () => props.show,
    (val) => {
        if (!val) {
            resetState();
        } else {
            internalImagePath.value = props.imagePath;
        }
    },
    { immediate: true }
);

/**
 * 图片加载完成
 */
const onImageLoad = () => {
    uni.getImageInfo({
        src: internalImagePath.value,
        success: (info) => {
            originalWidth.value = info.width;
            originalHeight.value = info.height;
            // 保存本地路径，确保 canvas drawImage 兼容远程URL
            localImagePath.value = info.path || internalImagePath.value;

            nextTick(() => {
                uni.createSelectorQuery()
                    .in(instance.proxy)
                    .select("#cropperBody")
                    .boundingClientRect((rect) => {
                        if (!rect) return;
                        containerRect.left = rect.left;
                        containerRect.top = rect.top;
                        containerRect.width = rect.width;
                        containerRect.height = rect.height;

                        // 计算 aspectFit 模式下图片的实际显示区域
                        const imgRatio = info.width / info.height;
                        const containerRatio = rect.width / rect.height;

                        if (imgRatio > containerRatio) {
                            // 宽度受限
                            imageDisplay.width = rect.width;
                            imageDisplay.height = rect.width / imgRatio;
                            imageDisplay.left = 0;
                            imageDisplay.top =
                                (rect.height - imageDisplay.height) / 2;
                        } else {
                            // 高度受限
                            imageDisplay.height = rect.height;
                            imageDisplay.width = rect.height * imgRatio;
                            imageDisplay.left =
                                (rect.width - imageDisplay.width) / 2;
                            imageDisplay.top = 0;
                        }
                    })
                    .exec();
            });
        },
    });
};

/**
 * 辅助函数：限制值在范围内
 */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * 快照当前选区
 */
const snapshotRect = () => {
    dragStartRect.left = selectionRect.left;
    dragStartRect.top = selectionRect.top;
    dragStartRect.width = selectionRect.width;
    dragStartRect.height = selectionRect.height;
};

/**
 * 命中检测：判断触摸点落在选区的哪个区域
 */
const getHitZone = (x, y) => {
    const left = selectionRect.left;
    const top = selectionRect.top;
    const right = left + selectionRect.width;
    const bottom = top + selectionRect.height;

    const nearX = (target) => Math.abs(x - target) <= CORNER_SLOP;
    const nearY = (target) => Math.abs(y - target) <= CORNER_SLOP;

    // 四角（优先级最高）
    if (nearX(left) && nearY(top)) return "resize-tl";
    if (nearX(right) && nearY(top)) return "resize-tr";
    if (nearX(left) && nearY(bottom)) return "resize-bl";
    if (nearX(right) && nearY(bottom)) return "resize-br";

    // 四边
    const inHorzSpan = x >= left - EDGE_SLOP && x <= right + EDGE_SLOP;
    const inVertSpan = y >= top - EDGE_SLOP && y <= bottom + EDGE_SLOP;

    if (inHorzSpan && Math.abs(y - top) <= EDGE_SLOP) return "resize-t";
    if (inHorzSpan && Math.abs(y - bottom) <= EDGE_SLOP) return "resize-b";
    if (inVertSpan && Math.abs(x - left) <= EDGE_SLOP) return "resize-l";
    if (inVertSpan && Math.abs(x - right) <= EDGE_SLOP) return "resize-r";

    // 选区内部
    if (x > left && x < right && y > top && y < bottom) return "move";

    return "outside";
};

/**
 * 触摸开始
 */
const onTouchStart = (e) => {
    if (!containerRect.width) return;
    const touch = e.touches[0];
    const x = touch.clientX - containerRect.left;
    const y = touch.clientY - containerRect.top;

    dragStart.x = x;
    dragStart.y = y;

    if (hasSelection.value) {
        const zone = getHitZone(x, y);
        if (zone === "outside") {
            // 重新框选
            selectionRect.left = x;
            selectionRect.top = y;
            selectionRect.width = 0;
            selectionRect.height = 0;
            hasSelection.value = false;
            interactionMode.value = "drawing";
        } else if (zone === "move") {
            snapshotRect();
            interactionMode.value = "moving";
        } else {
            snapshotRect();
            interactionMode.value = zone;
        }
    } else {
        selectionRect.left = x;
        selectionRect.top = y;
        selectionRect.width = 0;
        selectionRect.height = 0;
        interactionMode.value = "drawing";
    }
};

/** 新建选区 */
const handleDrawing = (x, y) => {
    selectionRect.left = Math.min(dragStart.x, x);
    selectionRect.top = Math.min(dragStart.y, y);
    selectionRect.width = Math.abs(x - dragStart.x);
    selectionRect.height = Math.abs(y - dragStart.y);
    hasSelection.value = selectionRect.width > 10 && selectionRect.height > 10;
};

/** 移动选区 */
const handleMoving = (dx, dy) => {
    const maxLeft = containerRect.width - dragStartRect.width;
    const maxTop = containerRect.height - dragStartRect.height;
    selectionRect.left = clamp(dragStartRect.left + dx, 0, maxLeft);
    selectionRect.top = clamp(dragStartRect.top + dy, 0, maxTop);
};

/** 调整选区大小 */
const handleResizing = (mode, dx, dy) => {
    const r = dragStartRect;
    let newLeft = r.left;
    let newTop = r.top;
    let newRight = r.left + r.width;
    let newBottom = r.top + r.height;

    if (mode.includes("l"))
        newLeft = clamp(r.left + dx, 0, newRight - MIN_SIZE);
    if (mode.includes("r"))
        newRight = clamp(
            r.left + r.width + dx,
            newLeft + MIN_SIZE,
            containerRect.width,
        );
    if (mode.includes("t")) newTop = clamp(r.top + dy, 0, newBottom - MIN_SIZE);
    if (mode.includes("b"))
        newBottom = clamp(
            r.top + r.height + dy,
            newTop + MIN_SIZE,
            containerRect.height,
        );

    selectionRect.left = newLeft;
    selectionRect.top = newTop;
    selectionRect.width = newRight - newLeft;
    selectionRect.height = newBottom - newTop;
};

/**
 * 触摸移动
 */
const onTouchMove = (e) => {
    if (interactionMode.value === "none") return;
    const touch = e.touches[0];
    const rawX = touch.clientX - containerRect.left;
    const rawY = touch.clientY - containerRect.top;
    const x = clamp(rawX, 0, containerRect.width);
    const y = clamp(rawY, 0, containerRect.height);
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    const mode = interactionMode.value;
    if (mode === "drawing") {
        handleDrawing(x, y);
    } else if (mode === "moving") {
        handleMoving(dx, dy);
    } else {
        handleResizing(mode, dx, dy);
    }
};

/**
 * 触摸结束
 */
const onTouchEnd = () => {
    if (interactionMode.value === "drawing") {
        hasSelection.value =
            selectionRect.width > MIN_SIZE && selectionRect.height > MIN_SIZE;
        if (!hasSelection.value) {
            selectionRect.left = 0;
            selectionRect.top = 0;
            selectionRect.width = 0;
            selectionRect.height = 0;
        }
    }
    interactionMode.value = "none";
};

/**
 * 遮罩样式
 */
const topMaskStyle = computed(() => ({
    top: "0px",
    left: "0px",
    width: "100%",
    height: selectionRect.top + "px",
}));

const bottomMaskStyle = computed(() => {
    const bottom = selectionRect.top + selectionRect.height;
    return {
        top: bottom + "px",
        left: "0px",
        width: "100%",
        bottom: "0px",
    };
});

const leftMaskStyle = computed(() => ({
    top: selectionRect.top + "px",
    left: "0px",
    width: selectionRect.left + "px",
    height: selectionRect.height + "px",
}));

const rightMaskStyle = computed(() => {
    const right = selectionRect.left + selectionRect.width;
    return {
        top: selectionRect.top + "px",
        left: right + "px",
        right: "0px",
        height: selectionRect.height + "px",
    };
});

/**
 * 选区边框样式
 */
const selectionBorderStyle = computed(() => ({
    top: selectionRect.top + "px",
    left: selectionRect.left + "px",
    width: selectionRect.width + "px",
    height: selectionRect.height + "px",
}));

/**
 * 确认截取
 */
const handleConfirm = async () => {
    if (!hasSelection.value || cropping.value) return;

    try {
        cropping.value = true;

        // 将选区坐标映射到原始图片像素坐标
        const scaleX = originalWidth.value / imageDisplay.width;
        const scaleY = originalHeight.value / imageDisplay.height;

        const imgSelLeft = (selectionRect.left - imageDisplay.left) * scaleX;
        const imgSelTop = (selectionRect.top - imageDisplay.top) * scaleY;
        const imgSelWidth = selectionRect.width * scaleX;
        const imgSelHeight = selectionRect.height * scaleY;

        // 限制在图片范围内
        const cropX = Math.max(0, Math.round(imgSelLeft));
        const cropY = Math.max(0, Math.round(imgSelTop));
        const cropW = Math.min(
            Math.round(imgSelWidth),
            originalWidth.value - cropX,
        );
        const cropH = Math.min(
            Math.round(imgSelHeight),
            originalHeight.value - cropY,
        );

        if (cropW <= 0 || cropH <= 0) {
            uni.showToast({ title: "请在图片区域内选择", icon: "none" });
            cropping.value = false;
            return;
        }

        // 限制 canvas 尺寸，避免性能问题
        const MAX_SIZE = 1500;
        const ratio = Math.min(1, MAX_SIZE / Math.max(cropW, cropH));
        canvasWidth.value = Math.max(1, Math.round(cropW * ratio));
        canvasHeight.value = Math.max(1, Math.round(cropH * ratio));

        // App端需要等原生canvas组件尺寸真正更新 (与旋转逻辑同理)
        await new Promise((resolve) => setTimeout(resolve, 150));

        // 使用 canvas 绘制裁剪区域
        const ctx = uni.createCanvasContext("cropCanvas", instance.proxy);
        ctx.drawImage(
            localImagePath.value,
            cropX,
            cropY,
            cropW,
            cropH,
            0,
            0,
            canvasWidth.value,
            canvasHeight.value,
        );

        ctx.draw(false, () => {
            setTimeout(() => {
                uni.canvasToTempFilePath(
                    {
                        canvasId: "cropCanvas",
                        width: canvasWidth.value,
                        height: canvasHeight.value,
                        destWidth: cropW,
                        destHeight: cropH,
                        fileType: "jpg",
                        quality: 0.9,
                        success: (res) => {
                            cropping.value = false;
                            emit("confirm", res.tempFilePath);
                        },
                        fail: (err) => {
                            cropping.value = false;
                            console.error("裁剪导出失败:", err);
                            uni.showToast({
                                title: "截取失败，请重试",
                                icon: "none",
                            });
                        },
                    },
                    instance.proxy,
                );
            }, 300);
        });
    } catch (error) {
        cropping.value = false;
        console.error("截取出错:", error);
        uni.showToast({ title: "截取失败", icon: "none" });
    }
};

/**
 * 旋转
 */
const handleRotate = async () => {
    if (rotating.value || cropping.value || !localImagePath.value) return;
    
    try {
        rotating.value = true;
        uni.showLoading({ title: "旋转中..." });

        const info = await new Promise((resolve, reject) => {
            uni.getImageInfo({
                src: localImagePath.value,
                success: resolve,
                fail: reject
            });
        });

        const ow = info.width;
        const oh = info.height;

        // 限制 canvas 尺寸，避免性能问题
        const MAX_SIZE = 1500;
        const ratio = Math.min(1, MAX_SIZE / Math.max(ow, oh));
        const drawW = Math.max(1, Math.round(ow * ratio));
        const drawH = Math.max(1, Math.round(oh * ratio));
        
        // 旋转后画布尺寸交换宽高
        canvasWidth.value = drawH;
        canvasHeight.value = drawW;

        // App端需要等原生canvas组件尺寸真正更新
        await new Promise((resolve) => setTimeout(resolve, 150));

        const ctx = uni.createCanvasContext("cropCanvas", instance.proxy);
        
        // 平移到中心，旋转90度
        ctx.translate(drawH / 2, drawW / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(info.path, -drawW / 2, -drawH / 2, drawW, drawH);
        
        ctx.draw(false, () => {
            setTimeout(() => {
                uni.canvasToTempFilePath(
                    {
                        canvasId: "cropCanvas",
                        width: drawH,
                        height: drawW,
                        destWidth: drawH,
                        destHeight: drawW,
                        fileType: "jpg",
                        quality: 0.9,
                        success: (res) => {
                            // 更新路径
                            localImagePath.value = res.tempFilePath;
                            internalImagePath.value = res.tempFilePath;
                            // 清空选区
                            selectionRect.left = 0;
                            selectionRect.top = 0;
                            selectionRect.width = 0;
                            selectionRect.height = 0;
                            hasSelection.value = false;
                        },
                        fail: (err) => {
                            console.error("旋转导出失败:", err);
                            uni.showToast({ title: "旋转失败", icon: "none" });
                        },
                        complete: () => {
                            uni.hideLoading();
                            rotating.value = false;
                        }
                    },
                    instance.proxy
                );
            }, 300);
        });
    } catch (error) {
        console.error("旋转出错:", error);
        uni.hideLoading();
        uni.showToast({ title: "旋转失败", icon: "none" });
        rotating.value = false;
    }
};

/**
 * 使用原图
 */
const handleUseOriginal = () => {
    emit("useOriginal");
};

/**
 * 取消
 */
const handleCancel = () => {
    emit("cancel");
};

/**
 * 重置状态
 */
const resetState = () => {
    selectionRect.left = 0;
    selectionRect.top = 0;
    selectionRect.width = 0;
    selectionRect.height = 0;
    hasSelection.value = false;
    interactionMode.value = "none";
    cropping.value = false;
    rotating.value = false;
    localImagePath.value = "";
    internalImagePath.value = "";
};
</script>

<style scoped>
.cropper-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background-color: #000;
    display: flex;
    flex-direction: column;
}

.cropper-header {
    padding: 20rpx 30rpx;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.header-title {
    font-size: 34rpx;
    color: #fff;
    font-weight: 600;
}

.header-hint {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 6rpx;
}

.cropper-body {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: #000;
}

.source-image {
    width: 100%;
    height: 100%;
}

/* 遮罩层 */
.crop-mask {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.55);
    pointer-events: none;
}

.full-mask {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

/* 选区边框 */
.selection-border {
    position: absolute;
    border: 3rpx solid #fff;
    pointer-events: none;
    box-shadow: 0 0 0 1rpx rgba(0, 0, 0, 0.3);
}

/* 四角标记 */
.corner {
    position: absolute;
    width: 40rpx;
    height: 40rpx;
    border-color: #fff;
    border-style: solid;
    border-width: 0;
    pointer-events: none;
}

.corner.tl {
    top: -4rpx;
    left: -4rpx;
    border-top-width: 8rpx;
    border-left-width: 8rpx;
}

.corner.tr {
    top: -4rpx;
    right: -4rpx;
    border-top-width: 8rpx;
    border-right-width: 8rpx;
}

.corner.bl {
    bottom: -4rpx;
    left: -4rpx;
    border-bottom-width: 8rpx;
    border-left-width: 8rpx;
}

.corner.br {
    bottom: -4rpx;
    right: -4rpx;
    border-bottom-width: 8rpx;
    border-right-width: 8rpx;
}

/* 边缘手柄 */
.edge-handle {
    position: absolute;
    background-color: #fff;
    border-radius: 3rpx;
    pointer-events: none;
}

.edge-handle.edge-t,
.edge-handle.edge-b {
    width: 48rpx;
    height: 8rpx;
    left: 50%;
    transform: translateX(-50%);
}

.edge-handle.edge-t {
    top: -4rpx;
}

.edge-handle.edge-b {
    bottom: -4rpx;
}

.edge-handle.edge-l,
.edge-handle.edge-r {
    width: 8rpx;
    height: 48rpx;
    top: 50%;
    transform: translateY(-50%);
}

.edge-handle.edge-l {
    left: -4rpx;
}

.edge-handle.edge-r {
    right: -4rpx;
}

/* 三分线 */
.grid-line {
    position: absolute;
    pointer-events: none;
}

.grid-line.grid-h1,
.grid-line.grid-h2 {
    left: 0;
    right: 0;
    height: 1rpx;
    background-color: rgba(255, 255, 255, 0.3);
}

.grid-line.grid-h1 {
    top: 33.33%;
}

.grid-line.grid-h2 {
    top: 66.67%;
}

.grid-line.grid-v1,
.grid-line.grid-v2 {
    top: 0;
    bottom: 0;
    width: 1rpx;
    background-color: rgba(255, 255, 255, 0.3);
}

.grid-line.grid-v1 {
    left: 33.33%;
}

.grid-line.grid-v2 {
    left: 66.67%;
}

/* 底部操作栏 */
.cropper-footer {
    display: flex;
    padding: 24rpx 30rpx;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24rpx);
    background: rgba(0, 0, 0, 0.85);
    gap: 20rpx;
}

.footer-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40rpx;
    background: rgba(255, 255, 255, 0.15);
}

.footer-btn:active {
    opacity: 0.7;
}

.confirm-btn {
    background: #07c160;
}

.confirm-btn.disabled {
    background: rgba(255, 255, 255, 0.1);
    opacity: 0.5;
}

.btn-text {
    font-size: 28rpx;
}

.cancel-text {
    color: rgba(255, 255, 255, 0.8);
}

.btn-action-text {
    color: #fff;
}

.confirm-text {
    color: #fff;
    font-weight: 500;
}

/* 隐藏的 canvas */
.hidden-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
}
</style>
