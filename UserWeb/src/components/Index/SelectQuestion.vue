<template>
    <div class="question-container">
        <div class="stem">
            <el-check-tag 
                checked 
                type="primary"
                class="type-tag"
            >
                {{ question.isMultiple === 1 ? '多选' : '单选' }}
            </el-check-tag>
            <span class="question-index">【{{ index }}】</span>
            <span class="question-stem">{{ question.stem }}</span>
        </div>
        <div class="option-list">
            <div 
                v-for="(option, index) in question.options" 
                :key="index"
                class="option-item"
            >
                <el-tag round class="option-tag">
                    {{ String.fromCharCode(65 + index) }}
                </el-tag>
                <span class="option-content">{{ option.content }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    questionData: { 
        required: true,
    }
})
const question = computed(() => props.questionData)
const index = computed(() => props.index)
</script>
<style scoped>
.question-container {
    background: #fff;
    border-radius: 12px;
    padding: 10px 30px 28px 30px;
    font-size: 22px;
}

.stem {
    margin-bottom: 28px;
    font-size: 20px; 
    font-weight: 500;
    color: #333;
}

.type-tag {
    margin-right: 1px;
    font-size: 15px; 
    padding: 4px 7px;
}

.question-index {
    margin-right: 0px;
    color: #1e97ee;
    font-size: 19px;
    font-weight: bold;
}

.question-stem {
    flex: 1; 
    font-size: 21px; 
    color: #222;
    word-break: break-all;
}

.option-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.option-item {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 8px;
    padding: 18px 18px 18px 18px;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    font-size: 22px; 
    user-select: none;
}

.option-item:hover {
    background: #d7f2ff;
    box-shadow: 0 2px 8px rgba(64,158,255,0.08);
}

.option-tag {
    margin-right: 20px;
    background: #4d9ef0;
    color: #fff;
    font-size: 20px; 
    border: none;
}

.option-content {
    flex: 1;
    color: #333;
    font-size: 18px;
    word-break: break-all;
}
</style>