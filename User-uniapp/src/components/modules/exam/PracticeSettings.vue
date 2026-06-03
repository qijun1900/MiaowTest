<template>
    <view class="settings-list">
        <view class="setting-item">
            <text class="setting-label">练习数量</text>
            <view class="setting-control">
                <view class="slider-wrapper">
                    <t-slider
                        v-if="maxQuestions > 0"
                        :value="localQuestionCount"
                        @change="(e) => { localQuestionCount = e.value }"
                        :min="1"
                        :max="maxQuestions"
                    />
                </view>
                <text class="slider-value">{{ localQuestionCount }}题</text>
            </view>
        </view>

        <view class="setting-item">
            <text class="setting-label">题目乱序</text>
            <t-switch :value="localIsRandom" @change="(e) => { localIsRandom = e.value }" size="small" />
        </view>

        <view class="setting-item">
            <view class="label-with-tip">
                <text class="setting-label">选项乱序</text>
                <text class="label-tip">选择题有效</text>
            </view>
            <t-switch :value="localIsOptionRandom" @change="(e) => { localIsOptionRandom = e.value }" size="small" />
        </view>

        <view class="setting-item">
            <text class="setting-label">显示答案</text>
            <t-switch :value="localIsShowAnswer" @change="(e) => { localIsShowAnswer = e.value }" size="small" />
        </view>

        <view class="setting-item">
            <view class="label-with-tip">
                <text class="setting-label">刷题助手</text>
                <text v-if="disableHelper" class="label-tip error">{{ helpertip }}</text>
            </view>
            <t-switch
                :value="localIsShowHelper"
                @change="(e) => { localIsShowHelper = e.value }"
                size="small"
                :disabled="disableHelper"
            />
        </view>
    </view>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    questionCount: { type: Number },
    maxQuestions: { type: Number },
    isRandom: { type: Boolean, default: false },
    isOptionRandom: { type: Boolean, default: false },
    isShowAnswer: { type: Boolean, default: true },
    isShowHelper: { type: Boolean, default: true },
    disableHelper: { type: Boolean, default: false },
    helpertip: { type: String, default: "个人题库不支持此功能" },
});

const emit = defineEmits([
    "update:questionCount",
    "update:isRandom",
    "update:isOptionRandom",
    "update:isShowAnswer",
    "update:isShowHelper",
]);

const localQuestionCount = ref(props.questionCount);
const localIsRandom = ref(props.isRandom);
const localIsOptionRandom = ref(props.isOptionRandom);
const localIsShowAnswer = ref(props.isShowAnswer);
const localIsShowHelper = ref(props.isShowHelper);

watch(localQuestionCount, (v) => emit("update:questionCount", v));
watch(localIsRandom, (v) => emit("update:isRandom", v));
watch(localIsOptionRandom, (v) => emit("update:isOptionRandom", v));
watch(localIsShowAnswer, (v) => emit("update:isShowAnswer", v));
watch(localIsShowHelper, (v) => emit("update:isShowHelper", v));

watch(() => props.questionCount, (v) => { localQuestionCount.value = v; });
watch(() => props.isRandom, (v) => { localIsRandom.value = v; });
watch(() => props.isOptionRandom, (v) => { localIsOptionRandom.value = v; });
watch(() => props.isShowAnswer, (v) => { localIsShowAnswer.value = v; });
watch(() => props.isShowHelper, (v) => { localIsShowHelper.value = v; });
</script>

<style scoped>
.settings-list {
    display: flex;
    flex-direction: column;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-label {
    font-size: 30rpx;
    color: #333;
    white-space: nowrap;
}

.label-with-tip {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.label-tip {
    font-size: 22rpx;
    color: #bbb;
}

.label-tip.error {
    color: #ee4040;
}

.setting-control {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex: 1;
    justify-content: flex-end;
    margin-left: 24rpx;
}

.slider-wrapper {
    flex: 1;
    max-width: 340rpx;
}

.slider-value {
    font-size: 28rpx;
    color: #3c9cff;
    font-weight: 600;
    min-width: 60rpx;
    text-align: right;
}
</style>
