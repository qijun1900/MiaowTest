<template>
    <view class="question-favorite-container">
        <ThemeLoading v-if="loading" text="正在加载收藏题目..." />
        <!-- 科目筛选 -->
        <SubjectFilter
            v-model="selectedSubject"
            :filter-list="subjectList"
            :show-filter="filteredQuestions.length > 0 && loading === false"
        />
        <!-- 题目列表 -->
        <view class="question-list">
            <view
                v-for="(question, index) in filteredQuestions"
                :key="question.id"
                class="question-item"
            >
                <!-- 题目头部信息 -->
                <view class="question-header">
                    <view
                        class="subject-tag"
                        :style="{ backgroundColor: 'var(--app-brand)' }"
                    >
                        {{ question.examName }}
                    </view>
                    <view class="question-type type-all">
                        {{
                            formatInfo.getQuestionTypeText(
                                question.questionData.Type,
                            )
                        }}
                    </view>
                    <view class="favorite-status">
                        <text class="favorite-icon">⭐</text>
                    </view>
                </view>

                <!-- 题目内容 -->
                <view class="question-content">
                    <view class="question-number">第{{ index + 1 }}题</view>
                    <view class="question-stem">
                        <ContentRenderer :content="question.questionData.stem" />
                    </view>
                    <!-- 选择题选项 -->
                    <view
                        v-if="
                            question.questionData.Type === 1 &&
                            question.questionData.options
                        "
                        class="options-container"
                    >
                        <view
                            v-for="(option, optIndex) in question.questionData
                                .options"
                            :key="optIndex"
                            class="option-item"
                        >
                            <text class="option-label"
                                >{{ String.fromCharCode(65 + optIndex) }}.</text
                            >
                            <text class="option-text">{{
                                option.content
                            }}</text>
                        </view>
                    </view>
                </view>

                <!-- 收藏时间和操作 -->
                <view class="question-footer">
                    <view class="favorite-time">
                        <t-icon name="time" size="16px" color="var(--app-text-placeholder)" />
                        <text
                            >收藏于
                            {{ formatTime.getTime2(question.createTime) }}</text
                        >
                    </view>
                    <view class="question-actions">
                        <button
                            class="action-btn practice-btn"
                            @click="startPractice(question)"
                        >
                            查看题目
                        </button>
                        <button
                            class="action-btn remove-btn"
                            @click="removeFavorite(question.questionData)"
                        >
                            移除收藏
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view
            v-if="filteredQuestions.length === 0 && loading === false"
            class="empty-state"
        >
            <view class="empty-icon">📚</view>
            <text class="empty-text">暂无收藏的题目</text>
            <text class="empty-subtext">快去收藏一些题目吧~</text>
        </view>
    </view>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import {
    getUserFavoriteQuestionListAPI,
    deleteFavoriteQuestionAPI,
    practiceQuestionAPI,
} from "../../../API/Exam/QuestionAPI";
import formatInfo from "../../../util/format/questionType";
import formatTime from "../../../util/format/time";
import ThemeLoading from "../../core/ThemeLoading.vue";
import SubjectFilter from "../../core/Filter.vue";
import ContentRenderer from "../../common/ContentRenderer.vue";
import { useQuestionStore } from "../../../stores/modules/QuestionStore";
import { useObjectiveAnswerStore } from "../../../stores/modules/ObjectiveAnswerStore";
import { useSubjectiveAnswerStore } from "../../../stores/modules/SubjectiveAnswerStore";

const objectiveAnswerStore = useObjectiveAnswerStore();
const subjectiveAnswerStore = useSubjectiveAnswerStore();
const favoriteQuestions = ref([]);
const loading = ref(false);
const selectedSubject = ref("全部"); // 当前选中的科目，默认为"全部"
const QuestionStore = useQuestionStore();
const bankInfo = ref(null); // 题库信息

// 获取科目列表
const subjectList = computed(() => {
    // 从收藏题目中提取所有不重复的科目
    const subjects = [
        ...new Set(favoriteQuestions.value.map((q) => q.examName)),
    ]; //使用Set去重,[... ] - 使用扩展运算符将 Set 对象转换回数组,
    return subjects;
});

// 根据选中的科目筛选题目
const filteredQuestions = computed(() => {
    if (selectedSubject.value === "全部") {
        return favoriteQuestions.value;
    }
    return favoriteQuestions.value.filter(
        (question) => question.examName === selectedSubject.value,
    ); //返回符合条件的题目
});

// 开始练习
const startPractice = async (question) => {
    try {
        const res = await practiceQuestionAPI(
            question.questionData.Type,
            question.questionData._id,
        );
        if (res.code === 200) {
            // 先构建题库信息
            bankInfo.value = {
                bankId: res.data.examId,
                bankName: "系统题库",
                isUserBank: false, // 标识这是系统题库
            };
            // 将当前收藏的题目设置为练习题目
            QuestionStore.setCurrentQuestionIds([question.questionData._id]);

            // 直接设置题目数据，
            QuestionStore.SetUserBlankquestions([res.data]);

            // 设置用户选择的题目，并获取返回的题目数组
            const selectedQuestions = QuestionStore.setSelectedQuestions(
                1,
                false,
                false,
            );

            // 确保题目数据已正确设置
            if (selectedQuestions && selectedQuestions.length > 0) {
                // 清空之前的答案记录
                objectiveAnswerStore.clearAllAnswers();
                subjectiveAnswerStore.clearAllAnswers();

                // 导航到练习页面
                // 添加延迟，确保状态更新完成
                setTimeout(() => {
                    // 构建URL，传递题库信息
                    let url = "/pages/exam/PracticeView";
                    if (bankInfo.value) {
                        url += `?bankInfo=${encodeURIComponent(JSON.stringify(bankInfo.value))}`;
                    }
                    uni.navigateTo({
                        url: url,
                    });
                }, 300);
            } else {
                uni.showToast({
                    title: "题目数据设置失败",
                    icon: "none",
                });
            }
        } else {
            uni.showToast({
                title: "请求失败",
                icon: "none",
            });
        }
    } catch (error) {
        console.error("开始练习失败:", error);
        uni.showToast({
            title: "请求失败",
            icon: "none",
        });
    }
};

// 移除收藏
const removeFavorite = (question) => {
    uni.showModal({
        title: "移除收藏",
        content: "确定要移除这道题的收藏吗？",
        showCancel: true,
        cancelText: "取消",
        confirmText: "确定",
        confirmColor: "#FF4500",
        cancelColor: "#666666",
        success: (res) => {
            if (res.confirm) {
                // 从列表中移除
                deleteFavoriteQuestionAPI(question._id);
                favoriteQuestions.value = favoriteQuestions.value.filter(
                    (q) => q.questionData._id !== question._id,
                );
                // 显示移除成功提示
                uni.showToast({
                    title: "已移除收藏",
                    icon: "success",
                });
            }
        },
    });
};
// 页面加载时加载收藏列表
const loadFavoriteQuestions = async () => {
    loading.value = true;
    try {
        const res = await getUserFavoriteQuestionListAPI();
        if (res.code === 200) {
            favoriteQuestions.value = res.data;
        }
    } catch (error) {
        console.error("加载收藏列表失败:", error);
        uni.showToast({
            title: "加载失败",
            icon: "error",
        });
    } finally {
        loading.value = false;
    }
};
onMounted(() => {
    loadFavoriteQuestions();
});
</script>
<style scoped>
.question-favorite-container {
    padding: 8rpx;
    background-color: var(--app-bg-secondary);
    min-height: 100vh;
}

.question-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx; /* 卡片之间的间距 */
    padding: 20rpx;
}

.question-item {
    padding: 30rpx;
    background-color: var(--app-bg-container);
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.question-item:active {
    background-color: var(--app-bg-secondary);
}

.question-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    flex-wrap: wrap;
    gap: 12rpx;
}

.subject-tag {
    padding: 6rpx 16rpx;
    border-radius: 16rpx;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-bg-container);
    font-weight: 500;
    min-width: 100rpx;
    text-align: center;
}

.question-type {
    padding: 6rpx 16rpx;
    border-radius: 16rpx;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    font-weight: 500;
    border: 2rpx solid;
}

.type-all {
    color: var(--app-brand);
    border-color: var(--app-brand);
    background-color: var(--app-brand-light);
}

.type-unknown {
    color: var(--app-text-secondary);
    border-color: var(--app-text-secondary);
    background-color: var(--app-bg-secondary);
}

.favorite-status {
    margin-left: auto;
}

.favorite-icon {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: #ffd700;
}

.question-content {
    margin-bottom: 24rpx;
}

.question-number {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
    margin-bottom: 12rpx;
}

.question-stem {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
    line-height: 1.6;
    margin-bottom: 30rpx;
}

.options-container {
    margin-top: 20rpx;
    padding: 20rpx;
    background-color: var(--app-bg-secondary);
    border-radius: 12rpx;
}

.option-item {
    display: flex;
    align-items: flex-start;
    padding: 12rpx 0;
}

.option-item:last-child {
    border-bottom: none;
}

.option-label {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
    margin-right: 16rpx;
    min-width: 40rpx;
}

.option-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    line-height: 1.5;
    flex: 1;
}

.question-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx dashed #f0f0f0;
}

.favorite-time {
    display: flex;
    align-items: center;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}


.question-actions {
    display: flex;
    gap: 16rpx;
}

.action-btn {
    padding: 10rpx 20rpx;
    border-radius: 16rpx;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    border: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

.practice-btn {
    background: linear-gradient(135deg, #61abff, #49a4ff);
    color: var(--app-bg-container);
}

.practice-btn:active {
    background: linear-gradient(135deg, #357abd, #5b9cff);
    transform: scale(0.95);
}

.remove-btn {
    background-color: var(--app-bg-container);
    color: var(--app-danger);
    border: 2rpx solid var(--app-danger);
}

.remove-btn:active {
    background-color: var(--app-danger);
    color: var(--app-bg-container);
    transform: scale(0.95);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    text-align: center;
}

.empty-icon {
    font-size: calc(120rpx * var(--app-font-scale, 1));
    margin-bottom: 30rpx;
    opacity: 0.5;
}

.empty-text {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-bottom: 16rpx;
    font-weight: 500;
}

.empty-subtext {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
    .question-item {
        padding: 24rpx;
    }

    .question-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 20rpx;
    }

    .question-actions {
        width: 100%;
        justify-content: flex-end;
    }

    .question-title {
        font-size: calc(28rpx * var(--app-font-scale, 1));
    }

    .option-text {
        font-size: calc(26rpx * var(--app-font-scale, 1));
    }
}
</style>
