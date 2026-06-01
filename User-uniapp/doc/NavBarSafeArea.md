# 自定义导航栏与安全区适配规范

## 概述

所有 Tab 页面和需要自定义导航栏的页面，统一使用 `useNavBarSafeArea` composable 获取布局信息，避免手动计算状态栏高度、胶囊按钮位置等。

## Composable API

**路径**: `src/composables/useNavBarSafeArea.js`

```js
import { useNavBarSafeArea } from "../../composables/useNavBarSafeArea.js";

const {
    navBarInfo,         // 导航栏基础信息 (ref)
    safeAreaInfo,       // 安全区信息 (ref)
    refreshLayoutInfo,  // 手动刷新布局信息
    customNavbarStyle,  // 导航栏外层容器样式 (computed)
    navRowStyle,        // 导航栏内容行样式 (computed)
} = useNavBarSafeArea(options);
```

### 参数

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `reserveMenuButtonRight` | `boolean` | `false` | 是否预留胶囊按钮右侧空间（小程序必需） |
| `rightPaddingExtra` | `number` | `8` | 胶囊按钮右侧额外间距 (px) |

### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `navBarInfo` | `Ref<{ statusBarHeight, navBarHeight, totalHeight, menuButtonRect }>` | 导航栏基础数据 |
| `safeAreaInfo` | `Ref<{ top, bottom, left, right }>` | 安全区Insets |
| `refreshLayoutInfo` | `() => void` | 手动刷新（下拉刷新时调用） |
| `customNavbarStyle` | `ComputedRef<{ height, paddingTop, paddingRight? }>` | 固定导航栏外层样式 |
| `navRowStyle` | `ComputedRef<{ height }>` | 导航栏内容区高度（不含状态栏） |

## 标准模板结构

```vue
<template>
    <view class="container">
        <!-- 1. 固定头部 -->
        <view class="header-fixed" :style="customNavbarStyle">
            <view class="header-row" :style="navRowStyle">
                <!-- 导航栏内容：标题、按钮等 -->
            </view>
        </view>

        <!-- 2. 占位元素，高度 = 固定头部高度 -->
        <view :style="{ height: customNavbarStyle.height }"></view>

        <!-- 3. 页面内容 -->
        <view class="content">
            <!-- ... -->
        </view>
    </view>
</template>

<script setup>
import { useNavBarSafeArea } from "../../composables/useNavBarSafeArea.js";

const { customNavbarStyle, navRowStyle, refreshLayoutInfo } =
    useNavBarSafeArea({ reserveMenuButtonRight: true });
</script>

<style scoped>
.header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    /* 背景色根据页面设计调整 */
}

.header-row {
    display: flex;
    align-items: center;
    padding: 0 24rpx;
}
</style>
```

## 关键规则

### 层级 (z-index)

| 元素 | z-index | 说明 |
|------|---------|------|
| 固定导航栏 | `100` | 页面级固定元素 |
| 普通组件 | `1-50` | 不得超过导航栏 |
| 弹窗/遮罩 | 由组件库管理 | TDesign Overlay 自带高层级 |

**禁止**在子组件中设置 `z-index: 1000+`，层级统一由页面根元素控制。

### 已接入页面

| 页面 | 状态 | 说明 |
|------|------|------|
| `tab/exam.vue` | 已接入 | 使用 `PageHead` 组件（内部已用 `navBarHeightUtil`） |
| `tab/tools.vue` | 已接入 | 使用 `PageHead` 组件 |
| `tab/agent.vue` | 已接入 | 使用 `AgentHeader` 组件 |
| `tab/my.vue` | 已接入 | 直接使用 `useNavBarSafeArea` composable |

### 子组件规范

- 子组件（如 `GreetingBanner`、`UserInfoCard`）**不要**自行计算状态栏高度
- 子组件**不要**设置 `position: fixed` 或高 `z-index`
- 定位和间距由页面级容器统一管理

## 迁移指南

从手动计算迁移到 composable 的步骤：

```diff
- import navBarHeightUtil from "../../util/navBarHeight.js";
+ import { useNavBarSafeArea } from "../../composables/useNavBarSafeArea.js";

- const navBarInfo = ref({});
+ const { customNavbarStyle, navRowStyle } = useNavBarSafeArea({
+     reserveMenuButtonRight: true,
+ });

- // 手动计算 headerRowStyle
- const headerRowStyle = computed(() => { ... });

- <view class="header-row" :style="headerRowStyle">
+ <view class="header-fixed" :style="customNavbarStyle">
+     <view class="header-row" :style="navRowStyle">

- // onMounted 中手动获取
- navBarInfo.value = navBarHeightUtil.getNavBarInfo();
+ // composable 自动初始化并在 onShow 时刷新
```
