<template>
    <van-popup class="answer-sheet-popup" 
        @update:show="(val) => emit('update:show', val)" 
        closeable
        close-icon="close" 
        position="bottom" :style="{ height: '60%' }">
        <div class="action-but-container">
            <van-space :size="25">
                <van-button type="primary" round color="#5DADE2" @click="handleReset">
                    <template #icon>
                        <ResetIcon color="#00d2d3" />
                    </template>
                    清空答题记录
                </van-button>
                <van-button type="primary" round color="#5DADE2">
                    <template #icon>
                        <SubmitIcon color="#00d2d3" />
                    </template>
                    提交题目{待开发}
                </van-button>
            </van-space>
        </div>
        <div>
            <span class="answer-sheet-font">答题卡</span>
            <div class="answer-sheet-content">
                <van-grid :column-num="5" :gutter="10">
                    <van-grid-item v-for="(question, index) in props.questions" :key="question._id"
                        @click="handleItemClick(index)">
                        <div class="grid-item-number">{{ index + 1 }}</div>
                    </van-grid-item>
                </van-grid>
            </div>
        </div>
    </van-popup>
</template>

<script setup>
import ResetIcon from '../icons/ResetIcon.vue';
import SubmitIcon from '../icons/SubmitIcon.vue';


const props = defineProps({
    questions: Array
});

const emit = defineEmits(['update:show', 'reset', 'itemClick']);

const handleReset = () => {
    emit('reset');
}

const handleItemClick = (index) => {
    emit('itemClick', index);
    emit('update:show', false);
    
}
</script>

<style scoped>
.answer-sheet-popup {
    background-color: #ececec;
    border-radius: 16px;
}

.action-but-container {
    margin: 20px 20px;
    padding: 12px;
    background-color: #ffffff;
    border-radius: 16px;
}

.answer-sheet-font {
    font-size: 17.5px;
    font-weight: bold;
    color: #46484a;
    margin-left: 20px;
}

.answer-sheet-content {
    margin: 15px 20px;
    padding: 12px;
    background-color: #ffffff;
    border-radius: 12px;
}

.grid-item-number {
    font-size: 16px;
    font-weight: 800;
    color: #3e4042;
}
</style>