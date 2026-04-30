<template>
    <page-meta page-style="overflow: hidden;" />
    <view class="container" :style="containerStyle">
        <!--
            AgentHeader 内部结构说明：
            · .top-wrapper  →  flex 占位 spacer（高度 = 导航栏总高）
            · .custom-navbar →  position:fixed，真正悬浮在顶部
        -->
        <AgentHeader
            @menu-click="handleMenuClick"
            @new-chat="handleNewChat"
            @model-change="handleModelChange"
            @touchstart="handleTouchStart"
        />

        <!-- 内容滚动区 -->
        <scroll-view class="content" scroll-y :show-scrollbar="false" @scroll="handleScroll" @touchstart="handleTouchStart">
            <view class="content-inner">
                <WelcomePanel @action-click="handleWelcomeActionClick" />
                <view class="bubble-test-area">
                    <Bubble
                        ref="bubbleRef"
                        :content="bubbleTestContent"
                        :show-avatar="false"
                        shape="corner"
                        variant="shadow"
                        max-width="650rpx"
                        :is-markdown="true"
                        :typing="{ step: 2, interval: 35, suffix: '|' }"
                        @finish="handleBubbleFinish"
                    />
                </view>
            </view>
        </scroll-view>

        <!--
            当 container 的 bottom 随键盘上移时，sender 自然贴在容器底部，
            即键盘顶部，不会留下任何灰色空隙。
        -->
        <view class="sender-area" :style="senderAreaStyle">
            <AgentSender
                v-model="senderText"
                v-model:thinking="thinkingMode"
                :show-thinking-toggle="showThinkingToggle"
                @add-attachment="handleAddAttachment"
                @submit="handleSenderSubmit"
                @focus="handleSenderFocus"
                @blur="handleSenderBlur"
            />
        </view>

        <!-- 侧边栏支持手势关闭  -->
        <AgentSidebar
            v-model:show="sidebarVisible"
            @select-chat="handleSelectChat"
        />
    </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import AgentHeader from "../../components/modules/agent/AgentHeader.vue";
import AgentSender from "../../components/modules/agent/AgentSender.vue";
import AgentSidebar from "../../components/modules/agent/AgentSidebar.vue";
import Bubble from "../../components/modules/agent/Bubble.vue";
import WelcomePanel from "../../components/modules/agent/WelcomePanel.vue";
import { useAutoTabBar } from "../../composables/useAutoTabBar.js";
import {chatAPI} from "../../API/LLM/test.js"

// ─── 响应式状态 ────────────────────────────────────────────────────────────────
const sidebarVisible = ref(false);
const senderText = ref("");
const thinkingMode = ref(false);
const showThinkingToggle = ref(true);
const bubbleRef = ref(null);
const bubbleTestContent = ref(
    `# AI 深度分析报告：机器学习模型性能评估与优化策略

## 一、项目背景与目标

本次实验旨在评估 **XGBoost**、**随机森林** 和 **深度神经网络 (DNN)** 三类模型在 *电商用户购买行为预测* 任务上的表现。我们使用了一份包含 \`120,000\` 条记录、\`45\` 个特征的数据集，其中包括：

1. 用户基础属性（年龄、性别、会员等级等）
2. 行为序列特征（近7天浏览/收藏/加购次数）
3. 商品属性特征（类目、价格区间、折扣率）
4. 时间特征（访问时段、星期几、是否节假日）

> **核心问题**：在 \`CTR ~ 3.2%\` 的稀疏正样本场景下，如何选择最优模型并调参以达到最佳业务效果？

---

## 二、模型性能对比

### 2.1 总体指标

| 模型 | Accuracy | Precision | Recall | F1-Score | AUC | 训练时间 (s) | 推理延迟 (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **XGBoost** | 0.967 | **0.892** | 0.713 | 0.793 | **0.981** | 342.5 | **1.2** |
| **随机森林** | 0.958 | 0.874 | 0.695 | 0.774 | 0.972 | 184.7 | 3.8 |
| **DNN (3层)** | **0.972** | 0.885 | **0.738** | **0.805** | 0.979 | **689.3** | 2.1 |

### 2.2 混淆矩阵（XGBoost）

\\\`\\\`\\\`text
                预测: 负样本    预测: 正样本
真实: 负样本       89,234         1,893
真实: 正样本        2,156         8,717
\\\`\\\`\\\`

从混淆矩阵可以看出：
- **假阳性 (FP)**：\`1,893\` — 占比约 \`1.9%\`，尚可接受
- **假阴性 (FN)**：\`2,156\` — 占比约 \`19.8%\`，**需要重点关注**（漏单意味着直接损失）

---

## 三、特征重要性分析

通过对 XGBoost 模型进行 SHAP 值分析，我们得到了以下 **Top-10 重要特征**：

\\\`\\\`\\\`python
import shap
import matplotlib.pyplot as plt

# 加载训练好的 XGBoost 模型
model = xgb.Booster()
model.load_model("xgb_ctr_model.json")

# 计算 SHAP 值
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# 绘制汇总图
shap.summary_plot(
    shap_values,
    X_test,
    feature_names=feature_names,
    plot_type="bar",
    max_display=10,
    show=False
)
plt.title("Top-10 Feature Importance (SHAP)")
plt.tight_layout()
plt.savefig("shap_summary.png", dpi=150, bbox_inches="tight")
\\\`\\\`\\\`

### 3.1 重要特征排名

| 排名 | 特征名称 | 平均 SHAP 值 | 业务含义 | 影响方向 |
| ---: | --- | ---: | --- | :---: |
| 1 | \`cart_7d_count\` | 0.342 | 近7天加购次数 | **+** |
| 2 | \`favor_7d_count\` | 0.287 | 近7天收藏次数 | **+** |
| 3 | \`last_visit_hour\` | 0.198 | 最后访问时段 | ± |
| 4 | \`member_level\` | 0.176 | 会员等级(1-5) | **+** |
| 5 | \`avg_order_amount\` | 0.154 | 平均客单价 | **+** |
| 6 | \`discount_sensitivity\` | 0.132 | 折扣敏感度 | **+** |
| 7 | \`page_view_duration\` | 0.118 | 平均停留时长(s) | **+** |
| 8 | \`category_entropy\` | 0.097 | 浏览类目多样性 | **+** |
| 9 | \`is_weekend\` | 0.085 | 是否周末 | ± |
| 10 | \`device_type\` | 0.072 | 设备类型(ios/android) | ± |

---

## 四、超参数优化

### 4.1 贝叶斯优化结果

我们使用 \\\`Optuna\\\` 对 XGBoost 进行了 **200 轮** 贝叶斯超参数搜索，最优参数组合如下：

\\\`\\\`\\\`python
best_params = {
    "n_estimators": 850,           # 树的数量
    "max_depth": 7,                # 最大深度
    "learning_rate": 0.028,        # 学习率
    "subsample": 0.85,             # 行采样比例
    "colsample_bytree": 0.72,      # 列采样比例
    "min_child_weight": 5,         # 叶子节点最小权重和
    "gamma": 0.15,                 # 分裂最小损失减少
    "reg_alpha": 0.35,             # L1 正则化
    "reg_lambda": 2.15,            # L2 正则化
    "scale_pos_weight": 3.2,       # 正负样本权重比
}
\\\`\\\`\\\`

### 4.2 学习曲线分析

\\\`\\\`\\\`text
AUC
1.00 ┤
0.98 ┤ ╭───────────────────────╮
0.96 ┤╭╯                       ╰╮
0.94 ┤╯                          ╰╮
0.92 ┤                            ╰╮
0.90 ┤                              ╰──────────────────
     └──────────────────────────────────────────
     0     200    400    600    800   1000
              训练轮数 (n_estimators)
              训练集 AUC ──  验证集 AUC ──
\\\`\\\`\\\`

> **结论**：模型在 \`600\` 轮左右开始收敛，验证集 AUC 稳定在 \`0.981\`，未出现明显过拟合。

---

## 五、数学推导与公式

### 5.1 XGBoost 目标函数

XGBoost 在第 \`t\` 轮迭代时的目标函数为：

$$
\\mathcal{L}^{(t)} = \\sum_{i=1}^{n} \\left[ l\\left(y_i, \\hat{y}_i^{(t-1)} + f_t(x_i)\\right) \\right] + \\Omega(f_t)
$$

对损失函数进行**二阶泰勒展开**：

$$
\\mathcal{L}^{(t)} \\approx \\sum_{i=1}^{n} \\left[ g_i f_t(x_i) + \\frac{1}{2} h_i f_t^2(x_i) \\right] + \\Omega(f_t)
$$

其中 \\(g_i = \\partial_{\\hat{y}^{(t-1)}} l(y_i, \\hat{y}^{(t-1)})\\) 为一阶梯度，\\(h_i = \\partial^2_{\\hat{y}^{(t-1)}} l(y_i, \\hat{y}^{(t-1)})\\) 为二阶梯度。

### 5.2 叶子分裂增益公式

对于某个候选分裂点，增益计算公式为：

$$
Gain = \\frac{1}{2} \\left[ \\frac{G_L^2}{H_L + \\lambda} + \\frac{G_R^2}{H_R + \\lambda} - \\frac{(G_L + G_R)^2}{H_L + H_R + \\lambda} \\right] - \\gamma
$$

### 5.3 AUC 计算公式

AUC (Area Under the ROC Curve) 的 Wilcoxon-Mann-Whitney 统计量定义：

$$
AUC = \\frac{1}{n^+ n^-} \\sum_{i=1}^{n^+} \\sum_{j=1}^{n^-} \\mathbb{I}\\left( \\hat{y}_i^+ > \\hat{y}_j^- \\right)
$$

其中 \\(n^+\\) 为正样本数，\\(n^-\\) 为负样本数。

---

## 六、业务建议

基于以上分析，我们提出以下行动项：

1. **模型选型**：优先使用 **XGBoost** 作为线上模型，兼顾 AUC 和推理延迟
2. **特征工程**：
   - 重点优化 \`cart_7d_count\` 和 \`favor_7d_count\` 的特征交叉
   - 尝试将 \`last_visit_hour\` 做 **周期性编码**（sin/cos 变换）
   - 引入 \`session_interval\`（两次访问间隔）作为新特征
3. **阈值调优**：当前默认阈值为 \`0.5\`，建议根据 *业务成本* 重新校准：
   - 若 **召回优先**（如召回活动），阈值降至 \`0.32\`
   - 若 **精准优先**（如高优惠券发放），阈值升至 \`0.68\`
4. **监控告警**：部署后需监控以下指标：
   - 每日 AUC 衰减（> 0.02 需告警）
   - 特征分布漂移（PSI > 0.1 需告警）
   - 推理延迟 P99（> 50ms 需告警）

---

> **附录**：完整代码和实验日志已上传至仓库 \`experiments/ctr_modeling_v3/\`，可通过 \`notebooks/03_model_evaluation.ipynb\` 复现全部结果。`,
);

// ─── 键盘高度监听 ──────────────────────────────────────────────────────────────
const keyboardHeight = ref(0);
const systemInfo = uni.getSystemInfoSync();
const isAndroid = systemInfo.platform.toLowerCase() === 'android';

// ─── TabBar 自动隐藏与显示逻辑 ──────────────────────────────────────────────────
const { 
        handleScroll, // 监听内容区滚动以自动隐藏 TabBar
        handleTouchStart,// 监听输入区触摸以自动显示 TabBar
        handleSenderFocus, // 监听输入区 focus 以自动隐藏 TabBar
        handleSenderBlur // 监听输入区 blur 以自动隐藏 TabBar
    } = useAutoTabBar(keyboardHeight);

// H5：通过 visualViewport resize 计算键盘高度
const handleViewportResize = () => {
    // #ifdef H5
    if (typeof window !== "undefined" && window.visualViewport) {
        const diff = window.innerHeight - window.visualViewport.height;
        keyboardHeight.value = Math.max(0, diff);
    }
    // #endif
};

onMounted(() => {
    // 小程序 / App 使用官方 API
    // #ifdef MP-WEIXIN || APP-PLUS
    uni.onKeyboardHeightChange((res) => {
        keyboardHeight.value = res.height || 0;
    });
    // #endif

    // H5 使用 visualViewport
    // #ifdef H5
    window.visualViewport?.addEventListener("resize", handleViewportResize);
    // #endif
});

onUnmounted(() => {
    // #ifdef MP-WEIXIN || APP-PLUS
    uni.offKeyboardHeightChange();
    // #endif

    // #ifdef H5
    window.visualViewport?.removeEventListener("resize", handleViewportResize);
    // #endif
});

/**
 * 容器的 bottom 随键盘高度收缩。
 *
 * 键盘弹起 → container.bottom = keyboardHeight → 容器只覆盖键盘上方可视区域
 * 键盘收起 → container.bottom = 0             → 容器重新撑满全屏
 *
 * sender 作为 flex 末项，始终贴在容器底部，
 * 即键盘顶部，彻底消除两者之间的灰色空白。
 */
const containerStyle = computed(() => {
    let pushingHeight = keyboardHeight.value;
    
    // #ifdef APP-PLUS
    if (isAndroid) {
        // App端安卓平台设置了 softinputMode: "adjustResize"
        // 键盘弹起时系统会自动缩小 Webview 高度，不再需要手动上推
        pushingHeight = 0;
    }
    // #endif

    return {
        bottom: pushingHeight > 0 ? `${pushingHeight}px` : "0px",
        transition: "bottom 0.25s ease",
    };
});

/**
 * sender 区域的底部内边距：
 * · 键盘弹起时：仅保留小间距，不需要 safe-area（容器底部已经在键盘顶）
 * · 键盘收起时：加上 env(safe-area-inset-bottom) 适配底部安全区
 */
const senderAreaStyle = computed(() => ({
    paddingBottom:
        keyboardHeight.value > 0
            ? "14rpx"
            : "calc(14rpx + env(safe-area-inset-bottom))",
}));

// ─── 事件处理 ──────────────────────────────────────────────────────────────────
const handleMenuClick = () => {
    sidebarVisible.value = true;
};

const handleModelChange = (modelName) => {
    if (!modelName) return;
    uni.showToast({ title: `已切换 ${modelName}`, icon: "none" });
};

const handleNewChat = () => {
    uni.showToast({ title: "新建会话", icon: "none" });
};

const handleSelectChat = (chatId) => {
    uni.showToast({ title: `切换到会话 ${chatId}`, icon: "none" });
};

const handleWelcomeActionClick = (item) => {
    if (!item?.key) return;
    uni.showToast({ title: `点击了${item.title}`, icon: "none" });
};

const handleBubbleFinish = () => {
    console.log("Bubble 打字完成", bubbleRef.value?.progress);
};

const handleAddAttachment = () => {
    uni.showToast({ title: "添加附件", icon: "none" });
};

const handleSenderSubmit = ({ text, thinking }) => {
    if (!text) return;
    uni.showToast({
        title: thinking ? "思考模式发送" : "普通模式发送",
        icon: "none",
    });
    console.log("发送内容：", text);
    const response = chatAPI(text);
    console.log("模型回复：", response);
};
</script>

<style scoped>
/*
 * ── 根容器 ───────────────────────────────────────────────────────────────────
 * position:fixed + overflow:hidden 彻底禁止原生页面滚动/被键盘顶起。
 * bottom 由 containerStyle 动态控制，键盘弹起时容器向上收缩至键盘顶部，
 * 不会在 sender 和键盘之间留下任何背景色空白。
 */
.container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /* bottom 由 :style 绑定（containerStyle）动态注入 */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f6f7f9;
}

/* ── 内容滚动区 ──────────────────────────────────────────────────────────────── */
.content {
    flex: 1;
    /*
     * height: 0 是让 scroll-view 作为 flex 子项正确伸缩的关键。
     * 不写此行时，scroll-view 会被内容撑开而溢出。
     */
    height: 0;
    min-height: 0;
}

.content-inner {
    padding: 24rpx 0 160rpx;
}

.bubble-test-area {
    padding: 24rpx;
}

/*
 * ── 底部输入区（悬浮在内容上方）─────────────────────────────────
 * 使用 absolute 定位并贴在容器底部，不占用 flex 空间，使得文字可以滚动到被输入框遮挡的下方
 */
.sender-area {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    padding-top: 14rpx;
    background: transparent;
    pointer-events: none; /* 让空白区域透传点击 */
    /* padding-bottom 由 :style 绑定（senderAreaStyle）动态注入 */
}

/* 恢复内部元素的点击响应，因为外层使用 pointer-events: none */
.sender-area :deep( .sender-shell ) {
    pointer-events: auto;
}
</style>
