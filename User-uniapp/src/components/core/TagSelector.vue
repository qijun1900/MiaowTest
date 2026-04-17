<template>
    <view v-if="show" class="tags-section" :style="themeVars">
        <view class="tags-title">{{ title }}</view>

        <view v-if="selectedTags.length > 0" class="selected-tags">
            <view
                v-for="tagItem in visibleSelectedTags"
                :key="`${tagItem.tag}-${tagItem.index}`"
                class="tag-item selected"
            >
                <text>{{ tagItem.tag }}</text>
                <view class="tag-close" @click="removeTag(tagItem.index)">
                    <uni-icons
                        type="close"
                        size="14"
                        color="#ffffff"
                    ></uni-icons>
                </view>
            </view>

            <view
                v-if="hiddenSelectedCount > 0"
                class="tag-fold-toggle selected-toggle"
                @click="toggleSelectedExpanded"
            >
                <text class="tag-fold-text">{{ selectedFoldText }}</text>
                <uni-icons
                    :type="selectedExpanded ? 'arrowup' : 'arrowdown'"
                    size="14"
                    :color="currentPalette.foldIconColor"
                ></uni-icons>
            </view>
        </view>

        <view v-if="allowCustomInput" class="custom-tag-input">
            <input
                class="tag-input"
                v-model="customTagInput"
                :placeholder="customPlaceholder"
                @confirm="addCustomTag"
            />
            <view class="add-tag-btn" @click="addCustomTag">
                <uni-icons
                    type="plus"
                    size="20"
                    :color="currentPalette.inputAddBtnColor"
                ></uni-icons>
            </view>
        </view>

        <view class="recommended-tags">
            <view
                v-for="(tag, index) in visibleRecommendedTags"
                :key="`${tag}-${index}`"
                class="tag-item recommended"
                :class="{ added: selectedTags.includes(tag) }"
                @click="addRecommendedTag(tag)"
            >
                <uni-icons
                    type="plus"
                    size="12"
                    :color="currentPalette.recommendedIconColor"
                ></uni-icons>
                <text>{{ tag }}</text>
            </view>

            <view
                v-if="hiddenRecommendedCount > 0"
                class="tag-fold-toggle recommended-toggle"
                @click="toggleRecommendedExpanded"
            >
                <text class="tag-fold-text">{{ recommendedFoldText }}</text>
                <uni-icons
                    :type="recommendedExpanded ? 'arrowup' : 'arrowdown'"
                    size="14"
                    :color="currentPalette.foldIconColor"
                ></uni-icons>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    show: { //是否显示组件
        type: Boolean,
        default: false,
    },
    title: { //标题文本
        type: String,
        default: "标签",
    },
    modelValue: { //已选标签列表
        type: Array,
        default: () => [],
    },
    extraTags: { //额外推荐标签列表，优先级高于 defaultTags
        type: Array,
        default: () => [],
    },
    defaultTags: { //默认推荐标签列表
        type: Array,
        default: () => [
        ],
    },
    allowCustomInput: { //是否允许自定义输入
        type: Boolean,
        default: true,
    },
    customPlaceholder: { //占位符文本
        type: String,
        default: "在此标签...",
    },
    maxVisibleSelectedTags: { // 已选标签最大显示数量，超过后会折叠
        type: Number,
        default: 8,
    },
    maxVisibleRecommendedTags: { // 推荐标签最大显示数量，超过后会折叠
        type: Number,
        default: 10,
    },
    // 默认 default：与 QuestionTags 的暖色风格一致
    // 可选：default | white | blue
    theme: {
        type: String,
        default: "default",
    },
});

const emit = defineEmits(["update:modelValue"]);

const customTagInput = ref("");
const selectedExpanded = ref(false);
const recommendedExpanded = ref(false);

const themePaletteMap = {
    default: {
        sectionBg: "#fffbf7",
        sectionBorder: "#ffe8d6",
        titleColor: "#8b5a3c",
        selectedBg: "linear-gradient(135deg, #f4a460 0%, #e8956f 100%)",
        selectedTextColor: "#ffffff",
        selectedShadow: "0 4rpx 12rpx rgba(232, 149, 111, 0.25)",
        closeBg: "rgba(255, 255, 255, 0.3)",
        inputTextColor: "#8b5a3c",
        inputBorderColor: "#ffb88c",
        inputPlaceholderColor: "#d4a574",
        inputBg: "#ffffff",
        inputAddBtnColor: "#ff9a76",
        recommendedBg: "#fff5eb",
        recommendedTextColor: "#a67c52",
        recommendedBorderColor: "#ffe0c7",
        recommendedAddedBg: "#ffe8d6",
        recommendedAddedTextColor: "#d4a574",
        recommendedAddedBorderColor: "#ffd4b3",
        recommendedActiveBg: "#ffecd6",
        recommendedIconColor: "#999999",
        foldBorderColor: "#ffd4b3",
        foldTextColor: "#a67c52",
        foldIconColor: "#a67c52",
        selectedToggleBg: "#fff4eb",
        recommendedToggleBg: "#fff9f4",
    },
    white: {
        sectionBg: "#ffffff",
        sectionBorder: "#e8ecf3",
        titleColor: "#3f495a",
        selectedBg: "linear-gradient(135deg, #f2f5fb 0%, #e7edf7 100%)",
        selectedTextColor: "#4a5a73",
        selectedShadow: "0 4rpx 10rpx rgba(80, 97, 125, 0.12)",
        closeBg: "rgba(90, 110, 140, 0.25)",
        inputTextColor: "#3f495a",
        inputBorderColor: "#d6deea",
        inputPlaceholderColor: "#9aa5b5",
        inputBg: "#ffffff",
        inputAddBtnColor: "#7f8ca8",
        recommendedBg: "#f7f9fc",
        recommendedTextColor: "#66748a",
        recommendedBorderColor: "#e4e9f2",
        recommendedAddedBg: "#edf2fa",
        recommendedAddedTextColor: "#6d7d97",
        recommendedAddedBorderColor: "#d7dfec",
        recommendedActiveBg: "#ecf1f8",
        recommendedIconColor: "#8fa0b8",
        foldBorderColor: "#d7dfec",
        foldTextColor: "#6d7d97",
        foldIconColor: "#6d7d97",
        selectedToggleBg: "#f6f8fc",
        recommendedToggleBg: "#fafbfd",
    },
    blue: {
        sectionBg: "#f4f9ff",
        sectionBorder: "#d8e9ff",
        titleColor: "#2f5c9a",
        selectedBg: "linear-gradient(135deg, #4f9dff 0%, #3f7ef5 100%)",
        selectedTextColor: "#ffffff",
        selectedShadow: "0 4rpx 14rpx rgba(63, 126, 245, 0.22)",
        closeBg: "rgba(255, 255, 255, 0.3)",
        inputTextColor: "#2f5c9a",
        inputBorderColor: "#8ab9ff",
        inputPlaceholderColor: "#8caad6",
        inputBg: "#ffffff",
        inputAddBtnColor: "#4f9dff",
        recommendedBg: "#ebf4ff",
        recommendedTextColor: "#4b73b7",
        recommendedBorderColor: "#cfe3ff",
        recommendedAddedBg: "#dcecff",
        recommendedAddedTextColor: "#4a6fb0",
        recommendedAddedBorderColor: "#b8d4ff",
        recommendedActiveBg: "#d6e8ff",
        recommendedIconColor: "#4b73b7",
        foldBorderColor: "#b8d4ff",
        foldTextColor: "#4b73b7",
        foldIconColor: "#4b73b7",
        selectedToggleBg: "#edf5ff",
        recommendedToggleBg: "#f4f9ff",
    },
};

const normalizeTheme = (value = "") => {
    const text = String(value || "").trim().toLowerCase();
    if (["white", "plain", "light"].includes(text)) {
        return "white";
    }

    if (["blue", "light-blue", "lightblue", "sky"].includes(text)) {
        return "blue";
    }

    return "default";
};

const currentTheme = computed(() => normalizeTheme(props.theme));

const currentPalette = computed(() => {
    return themePaletteMap[currentTheme.value] || themePaletteMap.default;
});

const themeVars = computed(() => {
    const palette = currentPalette.value;
    return {
        "--tag-section-bg": palette.sectionBg,
        "--tag-section-border": palette.sectionBorder,
        "--tag-title-color": palette.titleColor,
        "--tag-selected-bg": palette.selectedBg,
        "--tag-selected-text": palette.selectedTextColor,
        "--tag-selected-shadow": palette.selectedShadow,
        "--tag-close-bg": palette.closeBg,
        "--tag-input-text": palette.inputTextColor,
        "--tag-input-border": palette.inputBorderColor,
        "--tag-input-placeholder": palette.inputPlaceholderColor,
        "--tag-input-bg": palette.inputBg,
        "--tag-recommended-bg": palette.recommendedBg,
        "--tag-recommended-text": palette.recommendedTextColor,
        "--tag-recommended-border": palette.recommendedBorderColor,
        "--tag-recommended-added-bg": palette.recommendedAddedBg,
        "--tag-recommended-added-text": palette.recommendedAddedTextColor,
        "--tag-recommended-added-border": palette.recommendedAddedBorderColor,
        "--tag-recommended-active-bg": palette.recommendedActiveBg,
        "--tag-fold-border": palette.foldBorderColor,
        "--tag-fold-text": palette.foldTextColor,
        "--tag-selected-toggle-bg": palette.selectedToggleBg,
        "--tag-recommended-toggle-bg": palette.recommendedToggleBg,
    };
});

const normalizeSingleTag = (tag) => {
    if (typeof tag === "string") {
        return tag.trim();
    }

    if (typeof tag === "number") {
        return String(tag).trim();
    }

    if (tag && typeof tag === "object") {
        const maybeText = tag.text ?? tag.label ?? tag.name ?? tag.value;
        return typeof maybeText === "string"
            ? maybeText.trim()
            : String(maybeText || "").trim();
    }

    return "";
};

const normalizeTagList = (list = []) => {
    const normalized = [];
    for (const item of Array.isArray(list) ? list : []) {
        const text = normalizeSingleTag(item);
        if (text && !normalized.includes(text)) {
            normalized.push(text);
        }
    }
    return normalized;
};

const recommendedTags = ref([]);

watch(
    () => [props.defaultTags, props.extraTags],
    ([newDefaultTags, newExtraTags]) => {
        const merged = normalizeTagList(newDefaultTags);
        const normalizedExtraTags = normalizeTagList(newExtraTags);

        for (const tag of normalizedExtraTags) {
            if (!merged.includes(tag)) {
                merged.push(tag);
            }
        }

        recommendedTags.value = merged;
    },
    { immediate: true, deep: true },
);

const selectedTags = computed({
    get: () => normalizeTagList(props.modelValue),
    set: (val) => emit("update:modelValue", normalizeTagList(val)),
});

const selectedLimit = computed(() =>
    Math.max(1, Number(props.maxVisibleSelectedTags) || 8),
);

const recommendedLimit = computed(() =>
    Math.max(1, Number(props.maxVisibleRecommendedTags) || 10),
);

const visibleSelectedTags = computed(() => {
    const withIndex = selectedTags.value.map((tag, index) => ({ tag, index }));
    return selectedExpanded.value
        ? withIndex
        : withIndex.slice(0, selectedLimit.value);
});

const hiddenSelectedCount = computed(() =>
    Math.max(0, selectedTags.value.length - selectedLimit.value),
);

const selectedFoldText = computed(() =>
    selectedExpanded.value
        ? "收起已选标签"
        : `展开剩余${hiddenSelectedCount.value}个`,
);

const visibleRecommendedTags = computed(() =>
    recommendedExpanded.value
        ? [...recommendedTags.value]
        : recommendedTags.value.slice(0, recommendedLimit.value),
);

const hiddenRecommendedCount = computed(() =>
    Math.max(0, recommendedTags.value.length - recommendedLimit.value),
);

const recommendedFoldText = computed(() =>
    recommendedExpanded.value
        ? "收起推荐标签"
        : `展开剩余${hiddenRecommendedCount.value}个`,
);

const toggleSelectedExpanded = () => {
    selectedExpanded.value = !selectedExpanded.value;
};

const toggleRecommendedExpanded = () => {
    recommendedExpanded.value = !recommendedExpanded.value;
};

watch(
    () => selectedTags.value.length,
    (len) => {
        if (len <= selectedLimit.value) {
            selectedExpanded.value = false;
        }
    },
);

watch(
    () => recommendedTags.value.length,
    (len) => {
        if (len <= recommendedLimit.value) {
            recommendedExpanded.value = false;
        }
    },
);

const addCustomTag = () => {
    const tag = customTagInput.value.trim();
    if (!tag) return;

    const currentTags = [...selectedTags.value];
    if (!currentTags.includes(tag)) {
        emit("update:modelValue", [...currentTags, tag]);
        customTagInput.value = "";
        return;
    }

    uni.showToast({
        title: "标签已存在",
        icon: "none",
    });
};

const addRecommendedTag = (tag) => {
    const normalizedTag = normalizeSingleTag(tag);
    if (!normalizedTag) return;

    const currentTags = [...selectedTags.value];
    if (!currentTags.includes(normalizedTag)) {
        emit("update:modelValue", [...currentTags, normalizedTag]);
        return;
    }

    uni.showToast({
        title: "标签已存在",
        icon: "none",
    });
};

const removeTag = (index) => {
    const currentTags = [...selectedTags.value];
    currentTags.splice(index, 1);
    emit("update:modelValue", currentTags);
};

watch(
    () => props.modelValue,
    (newVal) => {
        const normalized = normalizeTagList(newVal);
        const original = Array.isArray(newVal) ? newVal : [];
        const sameLength = normalized.length === original.length;
        const sameValue =
            sameLength &&
            normalized.every((item, idx) => item === original[idx]);

        if (!sameValue) {
            emit("update:modelValue", normalized);
        }
    },
    { immediate: true, deep: true },
);
</script>

<style scoped>
.tags-section {
    margin: 30rpx 0;
    padding: 30rpx;
    background: var(--tag-section-bg);
    border-radius: 16rpx;
    border: 1rpx solid var(--tag-section-border);
}

.tags-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--tag-title-color);
    margin-bottom: 20rpx;
}

.selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
}

.tag-item {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    border-radius: 50rpx;
    font-size: 26rpx;
    transition: all 0.3s;
}

.tag-item.selected {
    background: var(--tag-selected-bg);
    color: var(--tag-selected-text);
    gap: 12rpx;
    box-shadow: var(--tag-selected-shadow);
}

.tag-close {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background: var(--tag-close-bg);
    display: flex;
    align-items: center;
    justify-content: center;
}

.custom-tag-input {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;
}

.tag-input {
    flex: 1;
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    color: var(--tag-input-text);
    border: 2rpx solid var(--tag-input-border);
    border-radius: 12rpx;
    background: var(--tag-input-bg);
}

.tag-input::placeholder {
    color: var(--tag-input-placeholder);
}

.add-tag-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.recommended-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.tag-item.recommended {
    background: var(--tag-recommended-bg);
    color: var(--tag-recommended-text);
    gap: 6rpx;
    border: 1rpx solid var(--tag-recommended-border);
    padding: 12rpx 20rpx;
    font-size: 24rpx;
}

.tag-item.recommended.added {
    background: var(--tag-recommended-added-bg);
    color: var(--tag-recommended-added-text);
    border-color: var(--tag-recommended-added-border);
}

.tag-item.recommended:active {
    background: var(--tag-recommended-active-bg);
}

.tag-item.recommended uni-icons {
    transform: scale(0.9);
}

.tag-fold-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6rpx;
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    border: 1rpx dashed var(--tag-fold-border);
}

.selected-toggle {
    background: var(--tag-selected-toggle-bg);
}

.recommended-toggle {
    background: var(--tag-recommended-toggle-bg);
}

.tag-fold-text {
    font-size: 24rpx;
    color: var(--tag-fold-text);
}
</style>
