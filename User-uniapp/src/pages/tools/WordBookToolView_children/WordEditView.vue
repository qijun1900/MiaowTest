<template>
    <ThemeProvider>
        <view class="page">
            <!-- 导航栏 -->
            <view class="top-wrapper">
                <view class="custom-navbar" :style="customNavbarStyle">
                    <view class="nav-row" :style="navRowStyle">
                        <view class="nav-left" @click="handleBack">
                            <t-icon
                                name="chevron-left"
                                size="44rpx"
                                color="var(--app-text-primary)"
                            ></t-icon>
                        </view>
                        <text class="nav-title">{{
                            isEditMode ? "编辑单词" : "添加单词"
                        }}</text>
                        <view class="nav-right">
                            <view
                                class="save-btn"
                                :class="{ 'save-btn-disabled': submitting }"
                                @click="handleSave"
                            >
                                <text>保存</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <scroll-view class="main-scroll" scroll-y>
                <view class="form-container">
                    <!-- 单词输入 + AI 填充 -->
                    <view class="form-item">
                        <view class="form-label">
                            单词
                            <text class="required">*</text>
                        </view>
                        <view class="word-input-row">
                            <view
                                class="input-wrapper word-input-main"
                                :class="{ 'has-error': errors.word }"
                            >
                                <input
                                    class="form-input"
                                    v-model="form.word"
                                    placeholder="输入英文单词"
                                    :maxlength="60"
                                    @input="errors.word = ''"
                                    @confirm="handleAiLookup"
                                />
                            </view>
                            <view
                                class="ai-fill-btn"
                                :class="{ 'ai-fill-btn-loading': aiLoading }"
                                @click="handleAiLookup"
                            >
                                <t-icon
                                    v-if="!aiLoading"
                                    name="flash"
                                    size="28rpx"
                                    color="#fff"
                                ></t-icon>
                                <view v-else class="ai-spinner"></view>
                                <text>{{
                                    aiLoading ? "查询中" : "AI 填充"
                                }}</text>
                            </view>
                        </view>
                        <view v-if="errors.word" class="form-error">
                            <t-icon
                                name="info-circle"
                                size="28rpx"
                                color="var(--app-danger)"
                            ></t-icon>
                            <text>{{ errors.word }}</text>
                        </view>
                    </view>

                    <view class="form-item">
                        <view class="form-label">音标</view>
                        <view class="input-wrapper">
                            <input
                                class="form-input"
                                v-model="form.phonetic"
                                placeholder="如 /əˈbændən/"
                                :maxlength="60"
                            />
                        </view>
                    </view>

                    <view class="form-item">
                        <view class="form-label">
                            释义
                            <text class="required">*</text>
                        </view>
                        <view
                            class="input-wrapper"
                            :class="{ 'has-error': errors.meaning }"
                        >
                            <input
                                class="form-input"
                                v-model="form.meaning"
                                placeholder="请输入中文释义"
                                :maxlength="200"
                                @input="errors.meaning = ''"
                            />
                        </view>
                        <view v-if="errors.meaning" class="form-error">
                            <t-icon
                                name="info-circle"
                                size="28rpx"
                                color="var(--app-danger)"
                            ></t-icon>
                            <text>{{ errors.meaning }}</text>
                        </view>
                    </view>

                    <!-- 例句区域 -->
                    <view class="form-item">
                        <view class="form-label">例句</view>
                        <view class="textarea-wrapper">
                            <textarea
                                class="form-textarea"
                                v-model="form.example"
                                placeholder="请输入或从知识库检索例句"
                                :maxlength="500"
                                :auto-height="true"
                                :max-height="200"
                            ></textarea>
                        </view>
                    </view>

                    <!-- 知识库检索例句 -->
                    <view class="kb-section">
                        <view
                            class="kb-header"
                            @click="showKbPanel = !showKbPanel"
                        >
                            <view class="kb-title-row">
                                <t-icon
                                    name="book"
                                    size="32rpx"
                                    color="var(--app-brand)"
                                ></t-icon>
                                <text class="kb-title">从知识库检索例句</text>
                            </view>
                            <t-icon
                                :name="
                                    showKbPanel ? 'chevron-up' : 'chevron-down'
                                "
                                size="32rpx"
                                color="var(--app-text-secondary)"
                            ></t-icon>
                        </view>

                        <view v-if="showKbPanel" class="kb-body">
                            <!-- 空态提示 -->
                            <view v-if="kbList.length === 0" class="kb-empty-state">
                                <t-icon
                                    name="info-circle"
                                    size="40rpx"
                                    color="var(--app-text-placeholder)"
                                ></t-icon>
                                <text class="kb-empty-text">暂无可用的例句知识库</text>
                            </view>

                            <!-- 知识库选择 -->
                            <view v-else class="kb-select-row">
                                <text class="kb-select-label">知识库：</text>
                                <picker
                                    :range="kbNames"
                                    @change="handleKbChange"
                                >
                                    <view class="kb-picker">
                                        <text class="kb-picker-text">{{
                                            selectedKbName || "请选择知识库"
                                        }}</text>
                                        <t-icon
                                            name="chevron-down"
                                            size="28rpx"
                                            color="var(--app-text-secondary)"
                                        ></t-icon>
                                    </view>
                                </picker>
                            </view>

                            <!-- 检索按钮 -->
                            <view
                                class="kb-search-btn"
                                :class="{
                                    'kb-search-btn-disabled':
                                        !selectedKbId || kbSearching,
                                }"
                                @click="handleKbSearch"
                            >
                                <t-icon
                                    v-if="!kbSearching"
                                    name="search"
                                    size="28rpx"
                                    color="#fff"
                                ></t-icon>
                                <view v-else class="ai-spinner"></view>
                                <text>{{
                                    kbSearching ? "检索中..." : "检索例句"
                                }}</text>
                            </view>

                            <!-- 检索结果 -->
                            <view v-if="kbResults.length" class="kb-results">
                                <text class="kb-results-title"
                                    >检索结果（点击添加为例句）</text
                                >
                                <view
                                    v-for="(result, idx) in kbResults"
                                    :key="idx"
                                    class="kb-result-item"
                                    :class="{
                                        'kb-result-selected':
                                            selectedExamples.has(idx),
                                    }"
                                    @click="toggleExampleSelection(idx)"
                                >
                                    <view class="kb-result-check">
                                        <t-icon
                                            :name="
                                                selectedExamples.has(idx)
                                                    ? 'check-circle-filled'
                                                    : 'circle'
                                            "
                                            size="32rpx"
                                            :color="
                                                selectedExamples.has(idx)
                                                    ? 'var(--app-brand)'
                                                    : 'var(--app-text-placeholder)'
                                            "
                                        ></t-icon>
                                    </view>
                                    <view class="kb-result-content">
                                        <text class="kb-result-text">{{
                                            result.content
                                        }}</text>
                                        <text class="kb-result-source"
                                            >来源：{{ result.source }}</text
                                        >
                                    </view>
                                </view>
                                <view
                                    class="kb-apply-btn"
                                    @click="applySelectedExamples"
                                >
                                    <text>添加选中的例句</text>
                                </view>
                            </view>

                            <view
                                v-else-if="kbSearched && !kbSearching"
                                class="kb-empty"
                            >
                                <text>未找到相关例句，试试其他知识库</text>
                            </view>
                        </view>
                    </view>

                    <!-- 标签 -->
                    <view class="form-item">
                        <view class="form-label">标签</view>
                        <view class="tags-editor">
                            <view
                                v-for="(tag, idx) in form.tags"
                                :key="idx"
                                class="tag-chip"
                            >
                                <text>{{ tag }}</text>
                                <t-icon
                                    name="close"
                                    size="28rpx"
                                    color="var(--app-text-secondary)"
                                    @click="removeTag(idx)"
                                ></t-icon>
                            </view>
                            <view
                                v-if="!showTagInput"
                                class="tag-add-btn"
                                @click="showTagInput = true"
                            >
                                <t-icon
                                    name="add"
                                    size="28rpx"
                                    color="var(--app-brand)"
                                ></t-icon>
                                <text>添加</text>
                            </view>
                            <input
                                v-else
                                class="tag-input"
                                v-model="newTag"
                                placeholder="输入标签"
                                :maxlength="20"
                                @confirm="addTag"
                                @blur="addTag"
                            />
                        </view>
                        <view class="preset-tags">
                            <view
                                v-for="tag in presetTags"
                                :key="tag"
                                class="preset-tag"
                                :class="{ active: form.tags.includes(tag) }"
                                @click="togglePresetTag(tag)"
                            >
                                <text>{{ tag }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- AI 扩展信息（仅编辑模式且已有单词时显示） -->
                    <view v-if="form.word" class="ai-detail-section">
                        <view
                            class="ai-detail-header"
                            @click="showAiDetail = !showAiDetail"
                        >
                            <view class="ai-detail-title-row">
                                <t-icon
                                    name="lightbulb"
                                    size="32rpx"
                                    color="var(--app-warning)"
                                ></t-icon>
                                <text class="ai-detail-title">AI 扩展学习</text>
                            </view>
                            <t-icon
                                :name="
                                    showAiDetail ? 'chevron-up' : 'chevron-down'
                                "
                                size="32rpx"
                                color="var(--app-text-secondary)"
                            ></t-icon>
                        </view>

                        <view v-if="showAiDetail" class="ai-detail-body">
                            <view class="ai-detail-btns">
                                <view
                                    class="ai-detail-btn"
                                    @click="fetchAiDetail('mnemonic')"
                                >
                                    <text>💡 助记法</text>
                                </view>
                                <view
                                    class="ai-detail-btn"
                                    @click="fetchAiDetail('root')"
                                >
                                    <text>📖 词根</text>
                                </view>
                                <view
                                    class="ai-detail-btn"
                                    @click="fetchAiDetail('synonyms')"
                                >
                                    <text>🔗 近义词</text>
                                </view>
                                <view
                                    class="ai-detail-btn"
                                    @click="fetchAiDetail('similar')"
                                >
                                    <text>✏️ 形近词</text>
                                </view>
                            </view>

                            <view
                                v-if="aiDetailContent"
                                class="ai-detail-content"
                            >
                                <ContentRenderer
                                    :content="aiDetailContent"
                                    :isMarkdown="true"
                                />
                            </view>
                            <view
                                v-else-if="aiDetailLoading"
                                class="ai-detail-loading"
                            >
                                <view class="ai-spinner"></view>
                                <text>AI 生成中...</text>
                            </view>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../../components/core/ThemeProvider.vue";
import ContentRenderer from "../../../components/common/ContentRenderer.vue";
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import {
    addWordAPI,
    updateWordAPI,
    getWordDetailAPI,
    aiLookupWordAPI,
    aiWordDetailAPI,
    getKnowledgeBasesAPI,
    searchExamplesAPI,
} from "../../../API/Tools/WordListAPI";

const { customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

// ---- 路由参数 ----
const bookId = ref("");
const wordId = ref("");
const isEditMode = ref(false);

// ---- 表单 ----
const form = ref({
    word: "",
    phonetic: "",
    meaning: "",
    example: "",
    tags: [],
});
const errors = ref({ word: "", meaning: "" });
const submitting = ref(false);

// ---- 标签 ----
const showTagInput = ref(false);
const newTag = ref("");
const presetTags = [
    "CET4",
    "CET6",
    "考研",
    "雅思",
    "托福",
    "Text1",
    "Text2",
    "Text3",
    "Text4",
];

// ---- AI 智能填充 ----
const aiLoading = ref(false);

// ---- 知识库 ----
const showKbPanel = ref(false);
const kbList = ref([]);
const kbNames = ref([]);
const selectedKbId = ref("");
const selectedKbName = ref("");
const kbSearching = ref(false);
const kbSearched = ref(false);
const kbResults = ref([]);
const selectedExamples = ref(new Set());

// ---- AI 扩展 ----
const showAiDetail = ref(false);
const aiDetailContent = ref("");
const aiDetailLoading = ref(false);

// ---- AI 智能填充 ----
const handleAiLookup = async () => {
    const word = form.value.word.trim();
    if (!word || aiLoading.value) return;

    aiLoading.value = true;
    try {
        const res = await aiLookupWordAPI(word);
        if (res.code !== 200) throw new Error(res.message);

        const data = res.data || {};
        if (data.phonetic) form.value.phonetic = data.phonetic;
        if (data.meaning) form.value.meaning = data.meaning;
        if (data.example && !form.value.example)
            form.value.example = data.example;

        errors.value = { word: "", meaning: "" };
        uni.showToast({ title: "填充成功", icon: "success" });
    } catch (error) {
        uni.showToast({ title: error?.message || "AI 查询失败", icon: "none" });
    } finally {
        aiLoading.value = false;
    }
};

// ---- 知识库 ----
const loadKnowledgeBases = async () => {
    try {
        const res = await getKnowledgeBasesAPI("sentence");
        if (res.code !== 200) return;
        kbList.value = res.data || [];
        kbNames.value = kbList.value.map((kb) => kb.name);
    } catch (error) {
        console.error("获取知识库列表失败:", error);
    }
};

const handleKbChange = (e) => {
    const idx = Number(e.detail.value);
    const kb = kbList.value[idx];
    if (kb) {
        selectedKbId.value = kb._id;
        selectedKbName.value = kb.name;
    }
};

const handleKbSearch = async () => {
    const word = form.value.word.trim();
    if (!word) {
        uni.showToast({ title: "请先输入单词", icon: "none" });
        return;
    }
    if (!selectedKbId.value) {
        uni.showToast({ title: "请选择知识库", icon: "none" });
        return;
    }
    if (kbSearching.value) return;

    kbSearching.value = true;
    kbSearched.value = false;
    kbResults.value = [];
    selectedExamples.value = new Set();

    try {
        const res = await searchExamplesAPI({
            word,
            kbId: selectedKbId.value,
            topK: 5,
        });
        if (res.code !== 200) throw new Error(res.message);
        kbResults.value = (res.data?.examples || []).filter(
            (r) => r.content && r.content.length > 10,
        );
        kbSearched.value = true;
    } catch (error) {
        uni.showToast({ title: error?.message || "检索失败", icon: "none" });
    } finally {
        kbSearching.value = false;
    }
};

const toggleExampleSelection = (idx) => {
    const newSet = new Set(selectedExamples.value);
    if (newSet.has(idx)) {
        newSet.delete(idx);
    } else {
        newSet.add(idx);
    }
    selectedExamples.value = newSet;
};

const applySelectedExamples = () => {
    if (selectedExamples.value.size === 0) {
        uni.showToast({ title: "请先选择例句", icon: "none" });
        return;
    }

    const examples = [];
    selectedExamples.value.forEach((idx) => {
        if (kbResults.value[idx]) {
            examples.push(kbResults.value[idx].content);
        }
    });

    const existing = form.value.example.trim();
    const newExamples = examples.join("\n");
    form.value.example = existing ? `${existing}\n${newExamples}` : newExamples;

    selectedExamples.value = new Set();
    uni.showToast({
        title: `已添加 ${examples.length} 条例句`,
        icon: "success",
    });
};

// ---- 标签 ----
const addTag = () => {
    const tag = newTag.value.trim();
    if (tag && !form.value.tags.includes(tag)) {
        form.value.tags = [...form.value.tags, tag];
    }
    newTag.value = "";
    showTagInput.value = false;
};

const removeTag = (idx) => {
    form.value.tags = form.value.tags.filter((_, i) => i !== idx);
};

const togglePresetTag = (tag) => {
    if (form.value.tags.includes(tag)) {
        form.value.tags = form.value.tags.filter((t) => t !== tag);
    } else {
        form.value.tags = [...form.value.tags, tag];
    }
};

// ---- AI 扩展信息 ----
const fetchAiDetail = async (type) => {
    const word = form.value.word.trim();
    if (!word) {
        uni.showToast({ title: "请先输入单词", icon: "none" });
        return;
    }
    if (aiDetailLoading.value) return;

    aiDetailContent.value = "";
    aiDetailLoading.value = true;

    try {
        const res = await aiWordDetailAPI(word, type);
        if (res.code === 200 && res.data?.content) {
            aiDetailContent.value = res.data.content;
        } else {
            aiDetailContent.value = "AI 生成失败，请稍后重试";
        }
    } catch (error) {
        console.error("AI扩展信息失败:", error);
        aiDetailContent.value = "AI 生成失败，请稍后重试";
    } finally {
        aiDetailLoading.value = false;
    }
};

// ---- 保存 ----
const handleSave = async () => {
    if (submitting.value) return;

    // 校验
    errors.value = { word: "", meaning: "" };
    const word = form.value.word.trim();
    const meaning = form.value.meaning.trim();

    if (!word) {
        errors.value.word = "请输入单词";
        return;
    }
    if (!meaning) {
        errors.value.meaning = "请输入释义";
        return;
    }

    submitting.value = true;
    try {
        if (isEditMode.value) {
            const res = await updateWordAPI({
                id: wordId.value,
                word,
                phonetic: form.value.phonetic.trim(),
                meaning,
                example: form.value.example.trim(),
                tags: form.value.tags,
            });
            if (res.code !== 200) {
                if (res.code === 409) {
                    errors.value.word = "该单词已存在于此单词本中";
                    return;
                }
                throw new Error(res.message || "更新失败");
            }
            uni.showToast({ title: "更新成功", icon: "success" });
        } else {
            const res = await addWordAPI({
                wordBookId: bookId.value,
                word,
                phonetic: form.value.phonetic.trim(),
                meaning,
                example: form.value.example.trim(),
                tags: form.value.tags,
            });
            if (res.code !== 200) {
                if (res.code === 409) {
                    errors.value.word = "该单词已存在于此单词本中";
                    return;
                }
                throw new Error(res.message || "添加失败");
            }
            uni.showToast({ title: "添加成功", icon: "success" });
        }

        uni.$emit("wordList:refresh");

        if (isEditMode.value) {
            setTimeout(() => uni.navigateBack(), 500);
        } else {
            // 创建模式：重置表单继续添加
            form.value = {
                word: "",
                phonetic: "",
                meaning: "",
                example: "",
                tags: [],
            };
        }
    } catch (error) {
        uni.showToast({ title: error?.message || "保存失败", icon: "none" });
    } finally {
        submitting.value = false;
    }
};

// ---- 导航 ----
const handleBack = () => {
    uni.navigateBack();
};

// ---- 生命周期 ----
onLoad(async (options) => {
    bookId.value = options?.bookId || "";
    wordId.value = options?.id || "";
    isEditMode.value = !!wordId.value;

    // 加载知识库列表
    loadKnowledgeBases();

    // 编辑模式加载数据
    if (isEditMode.value) {
        try {
            const res = await getWordDetailAPI(wordId.value);
            if (res.code === 200 && res.data) {
                const d = res.data;
                form.value.word = d.word || "";
                form.value.phonetic = d.phonetic || "";
                form.value.meaning = d.meaning || "";
                form.value.example = d.example || "";
                form.value.tags = Array.isArray(d.tags) ? d.tags : [];
            }
        } catch (error) {
            console.error("加载单词详情失败:", error);
            uni.showToast({ title: "加载失败", icon: "none" });
        }
    }
});
</script>

<style scoped>
.page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--app-bg-page);
}

.top-wrapper {
    background: var(--app-bg-page);
    border-bottom: 1rpx solid var(--app-border);
    box-shadow: 0 4rpx 18rpx rgba(0, 0, 0, 0.04);
    z-index: 30;
}

.custom-navbar {
    padding-left: 18rpx;
    padding-right: 18rpx;
    box-sizing: border-box;
}
.nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
}
.nav-left {
    width: 80rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}
.nav-title {
    flex: 1;
    text-align: center;
    font-size: calc(34rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
}
.nav-right {
    width: 120rpx;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
}

.save-btn {
    padding: 10rpx 24rpx;
    border-radius: 999rpx;
    background: var(--app-brand);
}

.save-btn text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: #fff;
    font-weight: 600;
}

.save-btn-disabled {
    opacity: 0.5;
    pointer-events: none;
}

.main-scroll {
    flex: 1;
    min-height: 0;
}

.form-container {
    padding: 24rpx;
}

/* 单词输入行 */
.word-input-row {
    display: flex;
    gap: 12rpx;
}

.word-input-main {
    flex: 1;
}

.ai-fill-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 0 24rpx;
    height: 80rpx;
    border-radius: 14rpx;
    background: linear-gradient(
        135deg,
        var(--app-brand) 0%,
        var(--app-brand-hover) 100%
    );
    flex-shrink: 0;
}

.ai-fill-btn text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: #fff;
    font-weight: 600;
    white-space: nowrap;
}

.ai-fill-btn-loading {
    opacity: 0.7;
    pointer-events: none;
}

.ai-spinner {
    width: 28rpx;
    height: 28rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 表单 */
.form-item {
    margin-bottom: 28rpx;
}

.form-label {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
}

.required {
    color: var(--app-danger);
    margin-left: 6rpx;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: var(--app-bg-secondary);
    border-radius: 14rpx;
    padding: 0 20rpx;
    border: 2rpx solid transparent;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}

.input-wrapper:focus-within {
    background: var(--app-bg-container);
    border-color: var(--app-brand);
    box-shadow: 0 0 0 4rpx color-mix(in srgb, var(--app-brand) 10%, transparent);
}

.input-wrapper.has-error {
    border-color: var(--app-danger);
    box-shadow: 0 0 0 4rpx
        color-mix(in srgb, var(--app-danger) 10%, transparent);
}

.form-input {
    flex: 1;
    height: 80rpx;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.textarea-wrapper {
    background: var(--app-bg-secondary);
    border-radius: 14rpx;
    padding: 16rpx 20rpx;
    border: 2rpx solid transparent;
    transition:
        border-color 0.2s ease,
        background 0.2s ease;
}

.textarea-wrapper:focus-within {
    background: var(--app-bg-container);
    border-color: var(--app-brand);
}

.form-textarea {
    width: 100%;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    line-height: 1.6;
}

.form-error {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 8rpx;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-danger);
}

/* 知识库检索 */
.kb-section {
    margin-bottom: 28rpx;
    background: var(--app-bg-container);
    border-radius: 20rpx;
    border: 1rpx solid var(--app-border);
    overflow: hidden;
}

.kb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 24rpx;
}

.kb-title-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.kb-title {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
}

.kb-body {
    padding: 0 24rpx 24rpx;
    border-top: 1rpx solid var(--app-border);
}

.kb-select-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 16rpx;
}

.kb-select-label {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    flex-shrink: 0;
}

.kb-picker {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--app-bg-secondary);
    border-radius: 12rpx;
    padding: 12rpx 16rpx;
}

.kb-picker-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.kb-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin-top: 16rpx;
    height: 72rpx;
    border-radius: 12rpx;
    background: var(--app-brand);
}

.kb-search-btn text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: #fff;
    font-weight: 600;
}

.kb-search-btn-disabled {
    opacity: 0.5;
    pointer-events: none;
}

.kb-results {
    margin-top: 20rpx;
}

.kb-results-title {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-bottom: 12rpx;
    display: block;
}

.kb-result-item {
    display: flex;
    gap: 12rpx;
    padding: 16rpx;
    background: var(--app-bg-secondary);
    border-radius: 12rpx;
    margin-bottom: 10rpx;
    border: 2rpx solid transparent;
    transition:
        border-color 0.2s ease,
        background 0.2s ease;
}

.kb-result-item.kb-result-selected {
    border-color: var(--app-brand);
    background: color-mix(
        in srgb,
        var(--app-brand) 5%,
        var(--app-bg-secondary)
    );
}

.kb-result-check {
    flex-shrink: 0;
    padding-top: 4rpx;
}

.kb-result-content {
    flex: 1;
    min-width: 0;
}

.kb-result-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    line-height: 1.5;
    display: block;
}

.kb-result-source {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
    margin-top: 6rpx;
    display: block;
}

.kb-apply-btn {
    margin-top: 12rpx;
    padding: 14rpx;
    text-align: center;
    border-radius: 12rpx;
    background: color-mix(
        in srgb,
        var(--app-brand) 10%,
        var(--app-bg-container)
    );
    border: 1rpx solid var(--app-brand);
}

.kb-apply-btn text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
}

.kb-empty {
    padding: 24rpx;
    text-align: center;
}

.kb-empty text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.kb-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 32rpx 24rpx;
}

.kb-empty-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
    text-align: center;
    line-height: 1.6;
}

/* 标签 */
.tags-editor {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 12rpx;
}

.tag-chip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    background: var(--app-brand-light);
}

.tag-chip text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
}

.tag-add-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    border: 1rpx dashed var(--app-brand);
}

.tag-add-btn text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
}

.tag-input {
    width: 180rpx;
    height: 56rpx;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    background: var(--app-bg-secondary);
    border-radius: 999rpx;
    padding: 0 20rpx;
}

.preset-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}

.preset-tag {
    padding: 10rpx 22rpx;
    border-radius: 999rpx;
    background: var(--app-bg-secondary);
    border: 1rpx solid transparent;
    transition:
        background 0.2s ease,
        border-color 0.2s ease;
}

.preset-tag text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.preset-tag.active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.preset-tag.active text {
    color: var(--app-brand);
}

/* AI 扩展信息 */
.ai-detail-section {
    margin-top: 16rpx;
    background: var(--app-bg-container);
    border-radius: 20rpx;
    border: 1rpx solid var(--app-border);
    overflow: hidden;
}

.ai-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 24rpx;
}

.ai-detail-title-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.ai-detail-title {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
}

.ai-detail-body {
    padding: 0 24rpx 24rpx;
    border-top: 1rpx solid var(--app-border);
}

.ai-detail-btns {
    display: flex;
    gap: 12rpx;
    margin-top: 16rpx;
    flex-wrap: wrap;
}

.ai-detail-btn {
    padding: 10rpx 20rpx;
    border-radius: 999rpx;
    background: var(--app-bg-secondary);
    border: 1rpx solid var(--app-border);
}

.ai-detail-btn text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.ai-detail-btn:active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.ai-detail-content {
    margin-top: 16rpx;
    padding: 20rpx;
    background: var(--app-bg-secondary);
    border-radius: 14rpx;
}

.ai-detail-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 40rpx;
}

.ai-detail-loading text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}
</style>
