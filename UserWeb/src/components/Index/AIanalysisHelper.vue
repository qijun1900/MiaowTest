<template>
    <van-popup
        v-model:show="show"
        closeable
        position="bottom" 
        :round="true"
        :style="{ height: '80%' }">
        <div>
            <Divider 
                title="AI题目解析"
                position="center" 
                dividerFontSize="20px"
                padding="0 80px"
                borderColor="#00ddff"/>
            <div 
                v-for="item in questionData" 
                :key="item._id" 
                class="question-item">
                
                <div class="question-stem">
                    <span class="stem">{{ item.stem }}</span>
                </div>
                
                <!-- 选择题(Type 1) -->
                <div v-if="item.Type === 1" class="question-options">
                    <div 
                        v-for="(option,index) in item.options" 
                        :key="index" 
                        class="option-item">
                        <span class="option-content">
                            {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                            <span v-if="option.isCorrect" class="correct-answer">✓</span>
                        </span>
                    </div>
                </div>
                
                <!-- 填空题(Type 2) -->
                <div v-if="item.Type === 2" class="blank-answers">
                    <div 
                        v-for="(answer,index) in item.options" 
                        :key="index"
                        class="blank-item">
                        <span class="blank-label">空{{ index + 1 }}：</span>
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
        </div>
    </van-popup>
</template>

<script setup>
import { computed } from 'vue';
import Divider from '../FuntionComponents/Divider.vue';


const props = defineProps({
    modelValue: Boolean,
    questionData: [Object, Function]  // 修改为接受对象或函数
});

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const questionData = computed(() => {
    return typeof props.questionData === 'function' 
        ? props.questionData() 
        : props.questionData;
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
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
</style>