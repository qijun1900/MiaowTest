<template>
    <view v-if="show" class="tags-section">
        <view class="tags-title">标签</view>

        <!-- 已选标签 -->
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
                    color="#a67c52"
                ></uni-icons>
            </view>
        </view>

        <!-- 自定义标签输入 -->
        <view class="custom-tag-input">
            <input
                class="tag-input"
                v-model="customTagInput"
                placeholder="在此标签..."
                @confirm="addCustomTag"
            />
            <view class="add-tag-btn" @click="addCustomTag">
                <uni-icons type="plus" size="20" color="#ff9a76"></uni-icons>
            </view>
        </view>

        <!-- 推荐标签 -->
        <view class="recommended-tags">
            <view
                v-for="(tag, index) in visibleRecommendedTags"
                :key="`${tag}-${index}`"
                class="tag-item recommended"
                :class="{ added: selectedTags.includes(tag) }"
                @click="addRecommendedTag(tag)"
            >
                <uni-icons type="plus" size="12" color="#999"></uni-icons>
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
                    color="#a67c52"
                ></uni-icons>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
    extraTags: {
        type: Array,
        default: () => [],
    },
    maxVisibleSelectedTags: {
        type: Number,
        default: 8,
    },
    maxVisibleRecommendedTags: {
        type: Number,
        default: 10,
    },
});

const emit = defineEmits(["update:modelValue"]);

const customTagInput = ref("");
const selectedExpanded = ref(false);
const recommendedExpanded = ref(false);
const defaultTags = [
    "公式",
    "概念",
    "计算错误",
    "审题不清",
    "粗心",
    "解题方法",
    "其他",
];

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

// 合并默认标签和用户历史标签（去重），使用 watch 确保 uni-app 下响应性
const recommendedTags = ref([...defaultTags]);

watch(
    () => props.extraTags,
    (newTags) => {
        const merged = [...defaultTags];
        const normalizedExtraTags = normalizeTagList(newTags);
        if (normalizedExtraTags.length > 0) {
            for (const tag of normalizedExtraTags) {
                if (tag && !merged.includes(tag)) {
                    merged.push(tag);
                }
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
    return selectedExpanded.value ? withIndex : withIndex.slice(0, selectedLimit.value);
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

// 添加自定义标签
const addCustomTag = () => {
    const tag = customTagInput.value.trim();
    const currentTags = [...selectedTags.value];
    if (tag && !currentTags.includes(tag)) {
        emit("update:modelValue", [...currentTags, tag]);
        customTagInput.value = "";
    } else if (currentTags.includes(tag)) {
        uni.showToast({
            title: "标签已存在",
            icon: "none",
        });
    }
};

// 添加推荐标签
const addRecommendedTag = (tag) => {
    const normalizedTag = normalizeSingleTag(tag);
    const currentTags = [...selectedTags.value];
    if (normalizedTag && !currentTags.includes(normalizedTag)) {
        emit("update:modelValue", [...currentTags, normalizedTag]);
    } else {
        uni.showToast({
            title: "标签已存在",
            icon: "none",
        });
    }
};

// 移除标签
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
            sameLength && normalized.every((item, idx) => item === original[idx]);

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
    background: #fffbf7;
    border-radius: 16rpx;
    border: 1rpx solid #ffe8d6;
}

.tags-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #8b5a3c;
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
    background: linear-gradient(135deg, #f4a460 0%, #e8956f 100%);
    color: #ffffff;
    gap: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(232, 149, 111, 0.25);
}

.tag-close {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
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
    color: #8b5a3c;
    border: 2rpx solid #ffb88c;
    border-radius: 12rpx;
    background: #ffffff;
}

.tag-input::placeholder {
    color: #d4a574;
}

.add-tag-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff9a76;
}

.recommended-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.tag-item.recommended {
    background: #fff5eb;
    color: #a67c52;
    gap: 6rpx;
    border: 1rpx solid #ffe0c7;
    padding: 12rpx 20rpx;
    font-size: 24rpx;
}

.tag-item.recommended.added {
    background: #ffe8d6;
    color: #d4a574;
    border-color: #ffd4b3;
}

.tag-item.recommended:active {
    background: #ffecd6;
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
    border: 1rpx dashed #ffd4b3;
}

.selected-toggle {
    background: #fff4eb;
}

.recommended-toggle {
    background: #fff9f4;
}

.tag-fold-text {
    font-size: 24rpx;
    color: #a67c52;
}
</style>
