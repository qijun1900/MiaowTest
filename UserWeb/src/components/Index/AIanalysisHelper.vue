<template>
    <van-popup v-model:show="show" closeable position="bottom" :round="true" :style="{ height: '85%' }">
        <div>
            <Divider title="AI题目解析" position="center" dividerFontSize="20px" padding="0 80px" borderColor="#00ddff" />
            <div class="welcome-container">
                <Welcome :style="{ backgroundImage: background, borderStartStartRadius: 4 }"
                    icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                    title="Hello, 我是你的AI解题小助手"
                    description="Base on Ant Design, I can provide you with a detailed explanation of the problem 🐱"
                    class="welcome-animation" />
            </div>
            <div v-for="item in questionData" :key="item._id" class="question-item">

                <div class="question-stem">
                    <span class="stem">{{ item.stem }}</span>
                </div>

                <!-- 选择题(Type 1) -->
                <div v-if="item.Type === 1" class="question-options">
                    <div v-for="(option, index) in item.options" :key="index" class="option-item">
                        <span class="option-content">
                            {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                            <span v-if="option.isCorrect" class="correct-answer">✓</span>
                        </span>
                    </div>
                </div>

                <!-- 填空题(Type 2) -->
                <div v-if="item.Type === 2" class="blank-answers">
                    <div v-for="(answer, index) in item.options" :key="index" class="blank-item">
                        <span class="blank-label">空{{ index + 1 }}:</span>
                        <span class="blank-content">{{ answer.content }}</span>
                    </div>
                </div>

                <!-- 判断题(Type 3) -->
                <div v-if="item.Type === 3" class="judge-answer">
                    <span>答案：</span>
                    <span :class="['answer', item.answer === 1 ? 'correct' : 'wrong']">
                        {{ item.answer === 1 ? "正确" : "错误" }}
                    </span>
                </div>

                <!-- 简答题(Type 4) -->
                <div v-if="item.Type === 4" class="short-answer">
                    <div class="answer-title">参考答案：</div>
                    <div class="answer-content" v-html="item.content"></div>
                </div>
            </div>
            <div class="talk-container">
                <Flex gap="middle" vertical>
                    <Bubble placement="end" :content="request" :typing="{ step: 1, interval: 50, suffix: '🐱' }"
                        variant="shadow">
                        <template #avatar>
                            <TalkUserIcon />
                        </template>
                    </Bubble>
                    <Bubble :header="modelName" placement="start" :content="LlaRes"
                        :typing="{ step: 4, interval: 30, suffix: '😺' }" :messageRender="renderMarkdown" variant="shadow"
                        :loading="loading">
                        <template #avatar>
                            <TalkAIIcon />
                        </template>
                        <template #footer="{ content }">
                            <Space>
                                <Button 
                                    type="text" 
                                    size="small" 
                                    :icon="h(CopyOutlined)"
                                    @click="Copy(content)"/>
                            </Space>
                        </template>
                    </Bubble>
                </Flex>
                <div v-show="!loading">
                    <AiWarn />
                </div>

            </div>
        </div>
        <van-back-top :offset="200" />
    </van-popup>
</template>

<script setup>
import { computed, ref, onMounted, h } from 'vue';
import Divider from '../FuntionComponents/Divider.vue';
import { Welcome, Bubble } from 'ant-design-x-vue';
import { theme, Flex, Button, Space } from 'ant-design-vue';
import TalkAIIcon from '../icons/TalkAIIcon.vue';
import TalkUserIcon from '../icons/TalkUserIcon.vue';
import postExamAIanalyse from '@/API/postExamAIanalyse';
import { renderMarkdown } from '@/util/formatInfo';
import AiWarn from '../FuntionComponents/AiWarn.vue';
import { CopyOutlined, } from '@ant-design/icons-vue';
import Copy from '@/util/Copy';


const request = ref("请给我此题解析");
const LlaRes  =  ref("");
const loading = ref(true);
const modelName = ref("");

const props = defineProps({
    modelValue: Boolean,
    questionData: [Object, Function],  // 修改为接受对象或函数
});

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
//接受数据
const questionData = computed(() => {
    return typeof props.questionData === 'function'
        ? props.questionData()
        : props.questionData;
});
// 定义事件
const emit = defineEmits(['update:modelValue']);
// 定义背景样式
const items = [
    {
        algorithm: theme.defaultAlgorithm,
        background: 'linear-gradient(97deg, #f2f9fe 0%, #f7f3ff 100%)',
    },
];
// 提取背景样式
const background = items[0].background;

const sendRequest = async () => {
    try {
        const response = await postExamAIanalyse(questionData.value[0].stem, questionData.value[0]._id, questionData.value[0].Type);
        if (response.code === 200) {
            loading.value = false;
            LlaRes.value = response.data.Aidata;
            modelName.value = response.data.modelName
            console.log("解析结果", response);
        } else {
            LlaRes.value = "服务器繁忙，请稍后再试";
        }
    } catch (error) {
        console.error("请求失败:", error);
        loading.value = false;
        LlaRes.value = "服务器繁忙，请稍后再试";
    }
};

onMounted(() => {
    sendRequest();
    console.log("发送请求", questionData.value[0].stem);
});

</script>

<style scoped>
.welcome-container {
    margin-top: 10px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 10px;
}

.question-item {
    padding: 16px;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-left: 12px;
    margin-right: 12px;

}

.question-stem {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
}

/* 选择题样式 */
.question-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.option-item {
    padding: 8px 12px;
    border-radius: 4px;
    background: #f7f8fa;
}

.option-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.correct-answer {
    color: #07c160;
    font-weight: bold;
}

/* 填空题样式 */
.blank-answers {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.blank-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.blank-label {
    font-weight: 500;
    color: #1989fa;
}

/* 判断题样式 */
.judge-answer {
    display: flex;
    align-items: center;
    gap: 8px;
}

.correct {
    color: #07c160;
    font-weight: bold;
}

.wrong {
    color: #ee0a24;
    font-weight: bold;
}

/* 简答题样式 */
.short-answer {
    margin-top: 12px;
}

.answer-title {
    font-weight: 500;
    margin-bottom: 8px;
    color: #1989fa;
}

.answer-content {
    line-height: 1.6;
    padding: 8px;
    background: #f7f8fa;
    border-radius: 4px;
}

.talk-container {
    margin-left: 12px;
    margin-right: 12px;
}

.welcome-animation {
    animation:
        fadeInUp 0.6s ease-out forwards,
        pulse 2s infinite 0.6s;
    /* 0.6s延迟，等淡入动画完成后再开始 */
    opacity: 0;
    transform: translateY(20px);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}
</style>