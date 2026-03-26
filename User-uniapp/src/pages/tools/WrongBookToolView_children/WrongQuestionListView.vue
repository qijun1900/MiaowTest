<template>
    <view class="container">
        <!-- 固定头部区域 -->
        <view
            class="fixed-header"
            :class="{ 'header-hidden': !isHeaderVisible }"
        >
            <!-- 搜索栏 -->
            <view class="search-section">
                <view class="search-box">
                    <uni-icons
                        type="search"
                        size="20"
                        color="#ff9555"
                        class="search-icon"
                    ></uni-icons>
                    <input
                        class="search-input"
                        v-model="searchKeyword"
                        placeholder="搜索题目内容..."
                        placeholder-class="search-placeholder"
                        :hold-fast="true"
                        @input="handleSearch"
                    />
                    <uni-icons
                        v-if="searchKeyword"
                        type="clear"
                        size="18"
                        color="#999999"
                        class="clear-icon"
                        hover-class="none"
                        @click="clearSearch"
                    ></uni-icons>
                </view>
            </view>

            <!-- 分类标签栏 -->
            <view class="category-tabs">
                <scroll-view
                    class="tabs-scroll"
                    scroll-x
                    :show-scrollbar="false"
                >
                    <view class="tabs-wrapper">
                        <view
                            v-for="(tab, index) in tabs"
                            :key="index"
                            class="tab-item"
                            :class="{ 'tab-active': activeTab === tab.value }"
                            hover-class="none"
                            @click="switchTab(tab.value)"
                        >
                            <text class="tab-text">{{ tab.label }}</text>
                            <view
                                v-if="tab.count !== undefined"
                                class="tab-badge"
                                >{{ tab.count }}</view
                            >
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 筛选与排序栏 -->
            <view class="filter-toolbar">
                <view
                    class="filter-chip"
                    hover-class="none"
                    @click="toggleSortOrder"
                >
                    <uni-icons
                        :type="sortOrder === 'desc' ? 'arrowdown' : 'arrowup'"
                        size="14"
                        color="#ff9555"
                    ></uni-icons>
                    <text class="filter-chip-text">{{ sortOrderText }}</text>
                </view>

                <scroll-view
                    class="status-filter-scroll"
                    scroll-x
                    :show-scrollbar="false"
                >
                    <view class="status-filter-row">
                        <view
                            v-for="option in statusFilterOptions"
                            :key="option.value"
                            class="status-filter-item"
                            :class="{
                                'status-filter-item-active':
                                    statusFilter === option.value,
                            }"
                            hover-class="none"
                            @click="setStatusFilter(option.value)"
                        >
                            <text class="status-filter-text">{{
                                option.label
                            }}</text>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 错题列表 -->
        <view class="question-list">
            <!-- Loading 加载状态 -->
            <view v-if="loading" class="loading-container">
                <view class="loading-spinner"></view>
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 空状态提示 -->
            <view
                v-else-if="displayQuestionList.length === 0"
                class="empty-state"
            >
                <view class="empty-icon">
                    <uni-icons
                        type="folder-add"
                        size="120"
                        color="#ffd4a3"
                    ></uni-icons>
                </view>
                <view class="empty-title">暂无错题</view>
                <view class="empty-desc">{{ getEmptyMessage() }}</view>
                <view
                    v-if="activeTab === 'all' && searchKeyword === ''"
                    class="empty-action"
                    @click="handleAddQuestion"
                    hover-class="none"
                >
                    <uni-icons
                        type="plus"
                        size="18"
                        color="#ffffff"
                    ></uni-icons>
                    <text class="empty-action-text">添加第一道错题</text>
                </view>
            </view>

            <!-- 错题卡片列表 -->
            <view
                v-for="item in displayQuestionList"
                :key="item.id"
                class="question-card"
            >
                <!-- 状态标签 - 卡片右上角 -->
                <view class="status-badge" :class="`status-${item.status}`">
                    {{ item.statusText }}
                </view>

                <!-- 卡片头部 -->
                <view class="card-header">
                    <scroll-view
                        class="tags-scroll-view"
                        scroll-x
                        :show-scrollbar="false"
                    >
                        <view class="tags-row">
                            <view
                                v-for="(tag, tagIndex) in item.tags"
                                :key="tagIndex"
                                class="tag"
                                :class="`tag-${tag.type}`"
                            >
                                {{ tag.text }}
                            </view>
                        </view>
                    </scroll-view>
                </view>

                <!-- 题目内容 -->
                <view class="question-content">
                    <QuestionContentDisplay
                        :content="item._raw.stem"
                        :editable="true"
                        @fullscreen-change="handleFullscreenChange"
                        @image-cropped="
                            (data) => handleImageCropped(item, 'stem', data)
                        "
                    />
                </view>

                <!-- 日期和复习次数 -->
                <view class="question-meta">
                    <text class="meta-text"
                        >{{ formatTime.getTime2(item._raw.updatedAt) }} · 复习
                        {{ item.reviewCount }} 次</text
                    >
                    <view
                        class="answer-status"
                        hover-class="none"
                        @click="toggleAnswer(item)"
                    >
                        <text
                            :class="
                                item.showAnswer ? 'status-show' : 'status-hide'
                            "
                        >
                            {{ item.showAnswer ? "收起答案" : "查看答案" }}
                        </text>
                        <uni-icons
                            :type="item.showAnswer ? 'up' : 'down'"
                            size="14"
                            :color="item.showAnswer ? '#67c23a' : '#909399'"
                        ></uni-icons>
                    </view>
                </view>

                <!-- 答案区域（可展开） -->
                <view
                    class="answer-wrapper"
                    :class="{ 'answer-expanded': item.showAnswer }"
                >
                    <view class="answer-section">
                        <!-- 选择题选项预览 -->
                        <SelectOptionsPreview
                            v-if="
                                item._raw.Type === 1 &&
                                item._raw.options &&
                                item._raw.options.length > 0
                            "
                            :options="item._raw.options"
                            :userWrongAnswer="item._raw.wrongAnswer?.text || ''"
                        />

                        <!-- 判断题选项预览 -->
                        <JudgeOptionsPreview
                            v-if="item._raw.Type === 3"
                            :correctAnswer="
                                item._raw.correctAnswer?.text || 'A'
                            "
                            :userWrongAnswer="item._raw.wrongAnswer?.text || ''"
                        />

                        <!-- 我的错误答案 -->
                        <view
                            v-if="
                                item._raw.wrongAnswer?.text ||
                                (item._raw.wrongAnswer?.images &&
                                    item._raw.wrongAnswer.images.length > 0)
                            "
                        >
                            <view class="answer-title">我的错解</view>
                            <view class="answer-block wrong-answer">
                                <!-- 选择题/判断题：纯文本简洁显示 -->
                                <view
                                    v-if="
                                        (item._raw.Type === 1 ||
                                            item._raw.Type === 3) &&
                                        !item._raw.wrongAnswer?.images?.length
                                    "
                                    class="simple-answer"
                                >
                                    <text class="answer-text">{{
                                        item._raw.wrongAnswer?.text || ""
                                    }}</text>
                                </view>
                                <!-- 其他题型：使用完整组件 -->
                                <QuestionContentDisplay
                                    v-else
                                    :content="item._raw.wrongAnswer"
                                    :editable="true"
                                    @fullscreen-change="handleFullscreenChange"
                                    @image-cropped="
                                        (data) =>
                                            handleImageCropped(
                                                item,
                                                'wrongAnswer',
                                                data,
                                            )
                                    "
                                />
                            </view>
                        </view>

                        <!-- 正确答案 -->
                        <view
                            v-if="
                                item._raw.correctAnswer?.text ||
                                (item._raw.correctAnswer?.images &&
                                    item._raw.correctAnswer.images.length > 0)
                            "
                        >
                            <view class="answer-title">正确答案</view>
                            <view class="answer-block correct-answer">
                                <!-- 选择题/判断题：纯文本简洁显示 -->
                                <view
                                    v-if="
                                        (item._raw.Type === 1 ||
                                            item._raw.Type === 3) &&
                                        !item._raw.correctAnswer?.images?.length
                                    "
                                    class="simple-answer"
                                >
                                    <text class="answer-text">{{
                                        item._raw.correctAnswer?.text || ""
                                    }}</text>
                                </view>
                                <!-- 其他题型：使用完整组件 -->
                                <QuestionContentDisplay
                                    v-else
                                    :content="item._raw.correctAnswer"
                                    :editable="true"
                                    @fullscreen-change="handleFullscreenChange"
                                    @image-cropped="
                                        (data) =>
                                            handleImageCropped(
                                                item,
                                                'correctAnswer',
                                                data,
                                            )
                                    "
                                />
                            </view>
                        </view>

                        <!-- 解析/笔记 -->
                        <view
                            v-if="
                                item._raw.analysis?.text ||
                                (item._raw.analysis?.images &&
                                    item._raw.analysis.images.length > 0)
                            "
                            class="note-wrapper"
                        >
                            <view class="answer-title">解析 / 笔记 / 备注</view>
                            <view class="note-block">
                                <QuestionContentDisplay
                                    :content="item._raw.analysis"
                                    :editable="true"
                                    @fullscreen-change="handleFullscreenChange"
                                    @image-cropped="
                                        (data) =>
                                            handleImageCropped(
                                                item,
                                                'analysis',
                                                data,
                                            )
                                    "
                                />
                            </view>
                        </view>

                        <!-- 答案区域底部操作按钮 -->
                        <view class="answer-actions">
                            <view
                                class="answer-btn"
                                hover-class="none"
                                @click="editQuestion(item)"
                            >
                                <uni-icons
                                    type="compose"
                                    size="16"
                                    color="#ff9555"
                                ></uni-icons>
                                <text class="answer-btn-text">修改题目</text>
                            </view>
                            <view
                                class="answer-btn"
                                hover-class="none"
                                @click="markNeedReview(item)"
                            >
                                <uni-icons
                                    type="loop"
                                    size="16"
                                    color="#2196f3"
                                ></uni-icons>
                                <text class="answer-btn-text">需要复习</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 底部操作栏 -->
                <view class="card-footer">
                    <view
                        class="footer-left"
                        hover-class="none"
                        @click="handleDelete(item)"
                    >
                        <uni-icons
                            type="trash"
                            size="18"
                            color="#909399"
                        ></uni-icons>
                        <text class="footer-text">删除</text>
                    </view>
                    <view class="footer-right">
                        <!-- <view class="footer-btn" hover-class="none" @click="reviewQuestion(item)">
              <text class="btn-text">查看习题</text>
            </view> -->
                        <view
                            class="footer-btn primary"
                            :class="{ disabled: item.status === 'mastered' }"
                            hover-class="none"
                            @click="markAsMastered(item)"
                        >
                            <text class="btn-text">{{
                                item.status === "mastered"
                                    ? "已掌握"
                                    : "标记为掌握"
                            }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <view
                v-if="displayQuestionList.length > 0"
                class="load-more-container"
            >
                <view v-if="loadingMore" class="load-more-loading">
                    <view class="load-more-spinner"></view>
                    <text class="load-more-text">加载更多...</text>
                </view>
                <text v-else class="load-more-text">{{
                    hasMore ? "上拉加载更多" : "没有更多了"
                }}</text>
            </view>
        </view>

        <!--悬浮按钮 -->
        <dragButton
            v-if="questionList.length > 0 && !isFullscreen"
            butColor="#ffffff"
            v-model:show="isShowdragButton"
            :isDock="true"
            :existTabBar="true"
            iconType="folder-add-filled"
            iconColor="#ff9800"
            :bottomOffset="100"
            :popMenu="false"
            @btnClick="handleAddQuestion"
        />
    </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow, onReachBottom, onPageScroll } from "@dcloudio/uni-app";
import { useAutoHideHeader } from "../../../composables/useAutoHideHeader.js";
import dragButton from "../../../components/plug-in/drag-button/drag-button.vue";
import SelectOptionsPreview from "../../../components/modules/exam/SelectOptionsPreview.vue";
import JudgeOptionsPreview from "../../../components/modules/exam/JudgeOptionsPreview.vue";
import QuestionContentDisplay from "../../../components/modules/exam/QuestionContentDisplay.vue";
import {
    getWrongQuestionsAPI,
    deleteWrongQuestionAPI,
    markAsMasteredAPI,
    markAsNeedReviewAPI,
    updateWrongQuestionAPI,
} from "../../../API/Tools/wrongQuestionAPI";
import {
    uploadSingleFile,
    deleteRemoteImageFile,
} from "../../../composables/useImageUpload.js";
import formatTime from "../../../util/formatTime";

const WrongbookId = ref("");
const WrongbookTitle = ref("");
const searchKeyword = ref("");
const activeTab = ref("all");
const isShowdragButton = ref(true);

// 固定头部自动隐藏（3 秒无滚动隐藏，滚动时显示）
// handlePageScroll 必须在页面 <script setup> 中通过 onPageScroll() 直接注册
// 原因：uni-app 编译小程序时静态分析 <script setup>，写在 composable 内部会被漏掉
const { isHeaderVisible, handlePageScroll } = useAutoHideHeader(3000);
onPageScroll(handlePageScroll);

const isFullscreen = ref(false); // 是否有图片在全屏查看
const loading = ref(false); // 加载状态
const loadingMore = ref(false); // 触底加载状态
const hasMore = ref(true); // 是否还有更多
const currentPage = ref(1);
const totalQuestions = ref(0);
const PAGE_SIZE = 20;
let searchDebounceTimer = null;

// 排序与状态筛选
const sortOrder = ref("desc");
const statusFilter = ref("all");
const statusToApiValueMap = {
    new: 0,
    reviewing: 1,
    mastered: 2,
};
const statusFilterOptions = [
    { label: "全部状态", value: "all" },
    { label: "新题", value: "new" },
    { label: "复习中", value: "reviewing" },
    { label: "已掌握", value: "mastered" },
];

// 当前列表数据
const questionList = ref([]);
// 标签列表（通过接口加载全部标签）
const tabs = ref([{ label: "全部", value: "all", count: 0 }]);

const sortOrderText = computed(() =>
    sortOrder.value === "desc" ? "时间倒序" : "时间正序",
);

const getQuestionTimestamp = (item) => {
    const sourceTime =
        item?._raw?.updatedAt || item?._raw?.createdAt || item?._raw?.date;
    const timestamp = sourceTime ? new Date(sourceTime).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const displayQuestionList = computed(() => {
    let list = [...questionList.value];

    if (statusFilter.value !== "all") {
        list = list.filter((item) => item.status === statusFilter.value);
    }

    list.sort((a, b) => {
        const timeA = getQuestionTimestamp(a);
        const timeB = getQuestionTimestamp(b);
        return sortOrder.value === "desc" ? timeB - timeA : timeA - timeB;
    });

    return list;
});

const handleSearch = () => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(() => {
        resetAndFetchQuestions();
    }, 300);
};

const clearSearch = () => {
    searchKeyword.value = "";
    resetAndFetchQuestions();
};

const switchTab = (value) => {
    if (activeTab.value === value) return;
    activeTab.value = value;
    resetAndFetchQuestions();
};

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
};

const setStatusFilter = (value) => {
    if (statusFilter.value === value) return;
    statusFilter.value = value;
    resetAndFetchQuestions();
};

// 切换答案显示状态
const toggleAnswer = (item) => {
    item.showAnswer = !item.showAnswer;
};

const rebuildTabsFromLoadedQuestions = () => {
    const tagSet = new Set();
    questionList.value.forEach((item) => {
        const rawTags = item?._raw?.tags;
        if (Array.isArray(rawTags)) {
            rawTags.forEach((tag) => {
                if (tag) {
                    tagSet.add(tag);
                }
            });
        }
    });

    const nextTabs = [
        { label: "全部", value: "all", count: totalQuestions.value },
        ...Array.from(tagSet).map((tag) => ({ label: tag, value: tag })),
    ];

    tabs.value = nextTabs;

    const activeExists = tabs.value.some(
        (tab) => tab.value === activeTab.value,
    );
    if (!activeExists) {
        activeTab.value = "all";
    }
};

const mergeQuestionList = (oldList, newList) => {
    const idMap = new Map();
    [...oldList, ...newList].forEach((item) => {
        idMap.set(item.id, item);
    });
    return Array.from(idMap.values());
};

const formatQuestionItem = (q) => {
    // 题型映射
    const typeMap = {
        1: { text: "选择题", color: "blue" },
        2: { text: "填空题", color: "purple" },
        3: { text: "判断题", color: "red" },
        4: { text: "简答题", color: "orange" },
    };

    // 难度映射
    const difficultyMap = {
        easy: { text: "简单", color: "green" },
        medium: { text: "中等", color: "yellow" },
        hard: { text: "困难", color: "red" },
    };

    // 状态映射
    const statusMap = {
        0: { status: "new", text: "新题" },
        1: { status: "reviewing", text: "复习中" },
        2: { status: "mastered", text: "已掌握" },
    };

    // 构建标签数组
    const tags = [
        {
            text: typeMap[q.Type]?.text || "未知",
            type: typeMap[q.Type]?.color || "gray",
        },
        {
            text: difficultyMap[q.difficulty]?.text || "中等",
            type: difficultyMap[q.difficulty]?.color || "yellow",
        },
    ];

    // 添加用户自定义标签
    if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach((tag) => {
            tags.push({ text: `#${tag}`, type: "gray" });
        });
    }

    return {
        id: q._id,
        tags,
        status: statusMap[q.status]?.status || "new",
        statusText: statusMap[q.status]?.text || "新题",
        reviewCount: q.reviewCount || 0,
        showAnswer: false,
        _raw: q,
    };
};

const resetAndFetchQuestions = () => {
    hasMore.value = true;
    currentPage.value = 1;
    fetchWrongQuestions({ append: false });
};

// 提取题目中所有图片引用
const getQuestionImages = (question) => {
    if (!question) return [];

    const images = [];
    const pushImages = (list) => {
        if (Array.isArray(list)) {
            images.push(...list.filter(Boolean));
        }
    };

    pushImages(question.stem?.images);
    pushImages(question.correctAnswer?.images);
    pushImages(question.wrongAnswer?.images);
    pushImages(question.analysis?.images);

    if (Array.isArray(question.options)) {
        question.options.forEach((option) => {
            pushImages(option?.images);
            pushImages(option?.content?.images);
        });
    }

    // 去重，避免同一张图重复请求删除
    const imageMap = new Map();
    images.forEach((img) => {
        const key =
            typeof img === "string"
                ? img
                : `${img?._id || ""}|${img?.url || ""}`;
        if (key && !imageMap.has(key)) {
            imageMap.set(key, img);
        }
    });

    return Array.from(imageMap.values());
};

// 批量删除题目关联图片（不阻塞主流程）
const removeQuestionImages = async (question) => {
    const imageItems = getQuestionImages(question);
    if (!imageItems.length) return;

    await Promise.all(
        imageItems.map((imageItem) =>
            deleteRemoteImageFile(imageItem, { showToast: false }).catch(
                (err) => {
                    console.warn("删除题目关联图片失败:", err);
                },
            ),
        ),
    );
};

// 删除错题
const handleDelete = async (item) => {
    const confirm = await uni.showModal({
        title: "删除确认",
        content: "确定要删除这道错题吗？",
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4d4f",
        cancelColor: "#909399",
    });
    if (confirm.confirm) {
        try {
            uni.showLoading({ title: "删除中..." });
            const res = await deleteWrongQuestionAPI(item.id);
            if (res.code === 200) {
                removeQuestionImages(item._raw).catch(() => {});
                uni.hideLoading();
                uni.showToast({
                    title: "删除成功",
                    icon: "success",
                });
                questionList.value = questionList.value.filter(
                    (q) => q.id !== item.id,
                );
                totalQuestions.value = Math.max(0, totalQuestions.value - 1);
                rebuildTabsFromLoadedQuestions();
            } else {
                uni.hideLoading();
                uni.showToast({
                    title: res.message || "删除失败",
                    icon: "none",
                });
            }
        } catch (error) {
            uni.hideLoading();
            console.error("删除错题失败:", error);
            uni.showToast({
                title: "网络错误，请稍后重试",
                icon: "none",
            });
        }
    }
};

//标记为已掌握
const markAsMastered = async (item) => {
    if (item.status === "mastered") return;
    try {
        const res = await markAsMasteredAPI(item.id);
        if (res.code === 200) {
            item.status = "mastered";
            item.statusText = "已掌握";
            uni.showToast({
                title: "修改成功",
                icon: "none",
                position: "bottom",
            });
        } else {
            uni.showToast({
                title: res.message || "标记失败",
                icon: "none",
            });
        }
    } catch (error) {
        console.error("标记为已掌握失败:", error);
        uni.showToast({
            title: "网络错误，请稍后重试",
            icon: "none",
        });
    }
};

// TODO: 跳转到编辑页面或打开编辑弹窗
const editQuestion = (item) => {
    uni.navigateTo({
        url: `/pages/tools/WrongBookToolView_children/WrongQuestionDetailView?id=${WrongbookId.value}&title=${encodeURIComponent(WrongbookTitle.value)}&questionId=${item.id}`,
    });
};

//标记需要复习
const markNeedReview = async (item) => {
    try {
        const res = await markAsNeedReviewAPI(item.id);
        if (res.code === 200) {
            item.status = "reviewing";
            item.statusText = "复习中";
            uni.showToast({
                title: "修改成功",
                icon: "none",
                position: "bottom",
            });
        } else {
            uni.showToast({
                title: res.message || "标记失败",
                icon: "none",
            });
        }
    } catch (error) {
        console.error("标记为需要复习失败:", error);
        uni.showToast({
            title: "网络错误，请稍后重试",
            icon: "none",
        });
    }
};

// 图片全屏状态变化
const handleFullscreenChange = (visible) => {
    isFullscreen.value = visible;
};

// 全屏查看裁剪图片后，上传新图片并更新题目
const handleImageCropped = async (
    item,
    sectionKey,
    { index, tempFilePath },
) => {
    try {
        uni.showLoading({ title: "更新图片中..." });

        // 1. 保存旧图片引用
        const section = item._raw[sectionKey];
        const oldImage =
            section && section.images && index < section.images.length
                ? section.images[index]
                : null;

        // 2. 上传裁剪后的图片
        const newImage = await uploadSingleFile(tempFilePath);

        // 3. 替换本地数据中的图片
        if (section && section.images && index < section.images.length) {
            section.images[index] = newImage;
        }

        // 4. 调用 API 更新题目
        await updateWrongQuestionAPI({
            id: item.id,
            Type: item._raw.Type,
            stem: item._raw.stem,
            options: item._raw.options,
            correctAnswer: item._raw.correctAnswer,
            wrongAnswer: item._raw.wrongAnswer,
            analysis: item._raw.analysis,
            tags: item._raw.tags,
            difficulty: item._raw.difficulty,
        });

        // 5. 删除旧图片（更新成功后再删，避免失败时丢失图片）
        if (oldImage) {
            deleteRemoteImageFile(oldImage, { showToast: false }).catch(
                (err) => {
                    console.warn("删除旧图片失败:", err);
                },
            );
        }

        uni.hideLoading();
        uni.showToast({ title: "图片已更新", icon: "success" });
    } catch (error) {
        uni.hideLoading();
        console.error("更新图片失败:", error);
        uni.showToast({ title: "更新失败，请重试", icon: "none" });
    }
};

//跳转到添加题目页面
const handleAddQuestion = () => {
    uni.navigateTo({
        url: `/pages/tools/WrongBookToolView_children/WrongQuestionDetailView?id=${WrongbookId.value}&title=${encodeURIComponent(WrongbookTitle.value)}`,
    });
};

// 获取空状态提示消息
const getEmptyMessage = () => {
    if (searchKeyword.value.trim()) {
        return `没有找到包含"${searchKeyword.value}"的错题`;
    }
    if (statusFilter.value !== "all") {
        const currentStatus = statusFilterOptions.find(
            (option) => option.value === statusFilter.value,
        );
        return `暂无"${currentStatus?.label || "当前状态"}"错题`;
    }
    if (activeTab.value !== "all") {
        return `暂无"${activeTab.value}"标签的错题`;
    }
    return "点击右下角按钮开始添加错题吧";
};

// 获取错题列表数据
const fetchWrongQuestions = async ({ append = false } = {}) => {
    if (!WrongbookId.value) return;

    if (append) {
        if (loading.value || loadingMore.value || !hasMore.value) return;
        loadingMore.value = true;
    } else {
        if (loading.value) return;
        loading.value = true;
    }

    const page = append ? currentPage.value : 1;

    try {
        const res = await getWrongQuestionsAPI(WrongbookId.value, {
            page,
            pageSize: PAGE_SIZE,
            keyword: searchKeyword.value.trim(),
            tag: activeTab.value === "all" ? "" : activeTab.value,
            status:
                statusFilter.value === "all"
                    ? ""
                    : statusToApiValueMap[statusFilter.value],
        });

        if (res.code === 200) {
            const payload = res.data || {};
            const list = Array.isArray(payload) ? payload : payload.list || [];
            const pagination = Array.isArray(payload)
                ? null
                : payload.pagination;
            const formattedList = list.map(formatQuestionItem);

            if (append) {
                questionList.value = mergeQuestionList(
                    questionList.value,
                    formattedList,
                );
            } else {
                questionList.value = formattedList;
            }

            if (pagination && typeof pagination.total === "number") {
                totalQuestions.value = pagination.total;
            } else if (!append) {
                totalQuestions.value = formattedList.length;
            }

            if (pagination && typeof pagination.hasMore === "boolean") {
                hasMore.value = pagination.hasMore;
            } else {
                hasMore.value = formattedList.length >= PAGE_SIZE;
            }

            if (append) {
                if (hasMore.value) {
                    currentPage.value = page + 1;
                }
            } else {
                currentPage.value = hasMore.value ? 2 : 1;
            }

            rebuildTabsFromLoadedQuestions();
        } else {
            uni.showToast({
                title: res.message || "获取数据失败",
                icon: "none",
            });
        }
    } catch (error) {
        console.error("获取错题列表失败:", error);
        uni.showToast({
            title: "网络错误，请稍后重试",
            icon: "none",
        });
    } finally {
        if (append) {
            loadingMore.value = false;
        } else {
            loading.value = false;
        }
    }
};

onLoad(async (options) => {
    if (options.id) {
        WrongbookId.value = options.id;
    } else {
        uni.showToast({
            title: "参数错误",
            icon: "error",
        });
        setTimeout(() => uni.navigateBack(), 1000);
    }
    if (options.title) {
        WrongbookTitle.value = decodeURIComponent(options.title);
    }
});

onShow(() => {
    // 页面显示时刷新列表（从添加页面返回时会触发）
    if (WrongbookId.value) {
        resetAndFetchQuestions();
    }
    // 头部显示重置由 useAutoHideHeader 内部的 onShow 钩子自动处理
});

onReachBottom(() => {
    fetchWrongQuestions({ append: true });
});
</script>
<style scoped>
.container {
    min-height: 100vh;
    background: #fff9f2;
    padding-top: 0;
}

.fixed-header {
    position: sticky;
    top: 0;
    background: #fff9f2;
    z-index: 100;
    padding-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(255, 149, 85, 0.05);
    /* transform/opacity 属于合成层属性，不触发重排，不产生滚动事件 */
    transition:
        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(0);
    opacity: 1;
    will-change: transform, opacity;
}

/* 隐藏状态：向上滑出 + 淡出，pointer-events:none 防止误触隐藏区域 */
.header-hidden {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
}

/* 搜索栏样式 */
.search-section {
    padding: 24rpx 32rpx 16rpx;
}

.search-box {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 48rpx;
    padding: 20rpx 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(255, 149, 85, 0.08);
    border: 2rpx solid #ffe8d6;
}

.search-icon {
    margin-right: 16rpx;
    display: flex;
    align-items: center;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    color: #333333;
    height: 40rpx;
    line-height: 40rpx;
}

.search-placeholder {
    color: #cccccc;
}

.clear-icon {
    padding: 8rpx;
    margin-right: -8rpx;
    display: flex;
    align-items: center;
    cursor: pointer;
}

/* 分类标签栏样式 */
.category-tabs {
    padding: 0 32rpx;
}

.filter-toolbar {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 32rpx 0;
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    border-radius: 28rpx;
    border: 2rpx solid #ffd9bc;
    background: #fff3e8;
    flex-shrink: 0;
}

.filter-chip-text {
    font-size: 24rpx;
    color: #ff9555;
    font-weight: 500;
    white-space: nowrap;
}

.status-filter-scroll {
    flex: 1;
    white-space: nowrap;
}

.status-filter-row {
    display: inline-flex;
    gap: 12rpx;
    align-items: center;
}

.status-filter-item {
    padding: 12rpx 20rpx;
    border-radius: 28rpx;
    border: 2rpx solid #ffe8d6;
    background: #ffffff;
    transition: all 0.2s ease;
}

.status-filter-item-active {
    background: #ff9555;
    border-color: #ff9555;
}

.status-filter-text {
    font-size: 24rpx;
    color: #8b8b8b;
    white-space: nowrap;
}

.status-filter-item-active .status-filter-text {
    color: #ffffff;
    font-weight: 500;
}

.tabs-scroll {
    white-space: nowrap;
}

.tabs-wrapper {
    display: inline-flex;
    gap: 16rpx;
}

.tab-item {
    display: inline-flex;
    align-items: center;
    padding: 16rpx 32rpx;
    background: #ffffff;
    border-radius: 40rpx;
    border: 2rpx solid #ffe8d6;
    transition: all 0.3s ease;
    position: relative;
}

.tab-item.tab-active {
    background: #ff9555;
    border-color: #ff9555;
    box-shadow: 0 4rpx 12rpx rgba(255, 149, 85, 0.25);
}

.tab-text {
    font-size: 28rpx;
    color: #666666;
    white-space: nowrap;
    transition: color 0.3s ease;
}

.tab-active .tab-text {
    color: #ffffff;
    font-weight: 500;
}

.tab-badge {
    margin-left: 8rpx;
    background: #ffe8d6;
    color: #ff9555;
    font-size: 22rpx;
    padding: 2rpx 12rpx;
    border-radius: 20rpx;
    min-width: 32rpx;
    text-align: center;
    font-weight: 500;
}

.tab-active .tab-badge {
    background: rgba(255, 255, 255, 0.3);
    color: #ffffff;
}

/* 错题列表样式 */
.question-list {
    padding: 24rpx 32rpx;
    min-height: 60vh;
}

.load-more-container {
    padding: 16rpx 0 24rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

.load-more-loading {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.load-more-spinner {
    width: 24rpx;
    height: 24rpx;
    border: 3rpx solid #ffe8d6;
    border-top-color: #ff9555;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.load-more-text {
    font-size: 24rpx;
    color: #b0b0b0;
}

/* Loading 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 60rpx;
}

.loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid #ffe8d6;
    border-top-color: #ff9555;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #ff9555;
    font-weight: 500;
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 60rpx;
    text-align: center;
}

.empty-icon {
    margin-bottom: 40rpx;
    opacity: 0.6;
}

.empty-title {
    font-size: 36rpx;
    color: #ff9555;
    font-weight: 600;
    margin-bottom: 16rpx;
}

.empty-desc {
    font-size: 28rpx;
    color: #999999;
    line-height: 1.6;
    margin-bottom: 48rpx;
    max-width: 500rpx;
}

.empty-action {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 24rpx 48rpx;
    background: linear-gradient(135deg, #ff9555 0%, #ffb380 100%);
    border-radius: 48rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 149, 85, 0.3);
    transition: all 0.3s ease;
}

.empty-action:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(255, 149, 85, 0.2);
}

.empty-action-text {
    font-size: 30rpx;
    color: #ffffff;
    font-weight: 500;
}

.question-card {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 32rpx;
    padding-top: 56rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(255, 149, 85, 0.06);
    border: 2rpx solid #ffe8d6;
    position: relative;
}

/* 状态标签 - 卡片右上角贴纸样式 */
.status-badge {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    font-weight: 500;
    z-index: 10;
    white-space: nowrap;
}

.status-badge.status-new {
    background: #fff3e0;
    color: #ff9800;
    border: 2rpx solid #ffe8d6;
}

.status-badge.status-reviewing {
    background: #e3f2fd;
    color: #2196f3;
    border: 2rpx solid #bbdefb;
}

.status-badge.status-mastered {
    background: #e8f5e9;
    color: #4caf50;
    border: 2rpx solid #c8e6c9;
}

/* 卡片头部 */
.card-header {
    margin-bottom: 20rpx;
    padding-right: 120rpx;
}

.tags-scroll-view {
    white-space: nowrap;
    width: 100%;
}

.tags-row {
    display: inline-flex;
    gap: 12rpx;
    align-items: center;
}

.tag {
    padding: 8rpx 20rpx;
    border-radius: 24rpx;
    font-size: 24rpx;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.tag-blue {
    background: #e3f2fd;
    color: #2196f3;
}

.tag-green {
    background: #e8f5e9;
    color: #4caf50;
}

.tag-yellow {
    background: #fff8e1;
    color: #ffa726;
}

.tag-red {
    background: #ffebee;
    color: #f44336;
}

.tag-purple {
    background: #f3e5f5;
    color: #9c27b0;
}

.tag-orange {
    background: #fff3e0;
    color: #ff9800;
}

.tag-gray {
    background: #f5f5f5;
    color: #757575;
}

/* 题目内容 */
.question-content {
    margin-bottom: 20rpx;
}

/* 元信息 */
.question-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f5f5f5;
}

.meta-text {
    font-size: 24rpx;
    color: #999999;
}

.answer-status {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    background: #f5f5f5;
    cursor: pointer;
    transition: all 0.3s ease;
}

.answer-status:active {
    transform: scale(0.95);
    background: #eeeeee;
}

.status-show {
    font-size: 24rpx;
    color: #67c23a;
}

.status-hide {
    font-size: 24rpx;
    color: #909399;
}

/* 答案区域包装器 - 使用高度过渡 */
.answer-wrapper {
    max-height: 0;
    overflow: hidden;
    transition:
        max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease;
    opacity: 0;
}

.answer-wrapper.answer-expanded {
    max-height: 2000rpx;
    opacity: 1;
}

/* 答案区域 */
.answer-section {
    margin-top: 24rpx;
    padding-top: 20rpx;
    border-top: 2rpx solid #f5f5f5;
}

.answer-title {
    font-size: 28rpx;
    color: #333333;
    font-weight: 600;
    margin-bottom: 16rpx;
    margin-top: 28rpx;
}

.answer-title:first-child {
    margin-top: 0;
}

.answer-block {
    padding: 24rpx 32rpx;
    border-radius: 12rpx;
    margin-bottom: 8rpx;
    position: relative;
    padding-left: 40rpx;
}

.answer-block::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8rpx;
    border-radius: 12rpx 0 0 12rpx;
}

.wrong-answer {
    background: #fef0f0;
}

.correct-answer {
    background: #f0f9ff;
}

/* 简洁答案样式（用于选择题/判断题） */
.simple-answer {
    padding: 0;
}

.answer-text {
    font-size: 32rpx;
    line-height: 1.5;
    color: #333333;
    font-weight: 500;
}

/* 笔记区域 */
.note-wrapper {
    margin-top: 28rpx;
}

.note-block {
    padding: 20rpx 28rpx;
    background: #fafafa;
    border-radius: 12rpx;
}

/* 答案区域底部操作按钮 */
.answer-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 32rpx;
    padding-top: 24rpx;
    border-top: 2rpx solid #f5f5f5;
}

.answer-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 16rpx 24rpx;
    border-radius: 20rpx;
    background: #f5f5f5;
    cursor: pointer;
    transition: all 0.3s ease;
}

.answer-btn:active {
    transform: scale(0.95);
    background: #eeeeee;
}

.answer-btn:first-child {
    background: #fff8f0;
    border: 2rpx solid #ffe8d6;
}

.answer-btn:first-child:active {
    background: #ffedd9;
}

.answer-btn:last-child {
    background: #f0f7ff;
    border: 2rpx solid #d6ebff;
}

.answer-btn:last-child:active {
    background: #e3f2fd;
}

.answer-btn-text {
    font-size: 26rpx;
    color: #666666;
    font-weight: 500;
}

.answer-btn:first-child .answer-btn-text {
    color: #ff9555;
}

.answer-btn:last-child .answer-btn-text {
    color: #2196f3;
}

/* 卡片底部 */
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 2rpx solid #f5f5f5;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    background: #f5f5f5;
    cursor: pointer;
}

.footer-text {
    font-size: 24rpx;
    color: #909399;
}

.footer-right {
    display: flex;
    gap: 16rpx;
}

.footer-btn {
    padding: 12rpx 28rpx;
    border-radius: 20rpx;
    background: #f5f5f5;
    cursor: pointer;
}

.footer-btn.primary {
    background: #ff9555;
}

.footer-btn.primary.disabled {
    background: #e8f5e9;
}

.footer-btn .btn-text {
    font-size: 24rpx;
    color: #666666;
}

.footer-btn.primary .btn-text {
    color: #ffffff;
}

.footer-btn.primary.disabled .btn-text {
    color: #4caf50;
}
</style>
