<template>
<van-config-provider :theme-vars="themeVars">
    <div class="container">
        <TopBack
        title="题目设置"  
        :iconSize="27"
        navBarHeight="54px"
        navBarIconColor="#3b3c3d"/>
        <Divider position="left" title="题型信息"/>
        <div>
            <van-cell-group inset class="info-group">
                <van-cell 
                    title="类型名称"   
                    size="large" 
                    icon="description"
                    class="info-cell">
                    <template #value>
                        <span class="info-value">{{ store.currentTitle }}</span>
                    </template>
                </van-cell>
                <van-cell 
                    title="题目数量"   
                    size="large" 
                    icon="bar-chart-o"
                    class="info-cell">
                    <template #value>
                        <span class="info-value">{{ questions.length }}</span>
                    </template>
                </van-cell>
            </van-cell-group>
        </div>
        <Divider position="left" title="练习设置"/>
        <div class="settings-container">
            <div class="set-group">
                <span class="set-label">请选择题目数量：</span>   
                <van-slider 
                    v-model="practiceCount"
                    :max="questions.length"
                    :min="1"
                    bar-height="4px"
                    active-color="#1a86e4">
                    <template #button>
                        <div class="custom-button">{{ practiceCount }}</div>
                    </template>
                </van-slider> 
            </div>
            <div class="set-group"> 
                <span class="set-label">是否立即显示答案：</span>
                <van-switch 
                    v-model="IsshowAnswer"
                    size="24px"
                    active-color="#1a86e4">
                    <template #node>
                        <div class="icon-wrapper">
                            <van-icon :name="IsshowAnswer ? 'success' : 'cross'" />
                        </div>
                    </template>
                </van-switch>
            </div>
            <div class="set-group"> 
                <span class="set-label">题目顺序是否随机：</span>
                <van-switch 
                    v-model="IsRandom"
                    size="24px"
                    active-color="#1a86e4">
                    <template #node>
                        <div class="icon-wrapper">
                            <van-icon :name="IsRandom ? 'success' : 'cross'" />
                        </div>
                    </template>
                </van-switch>
            </div>
            <div class="set-group"> 
                <span class="set-label">是否开启AI解析助手:</span>
                <van-switch 
                    v-model="IsOPenAI"
                    size="24px"
                    active-color="#1a86e4">
                    <template #node>
                        <div class="icon-wrapper">
                            <van-icon :name="IsOPenAI ? 'success' : 'cross'" />
                        </div>
                    </template>
                </van-switch>
            </div>
            <div class="goexam-button">
                <van-button 
                    icon="bulb-o"
                    type="primary"  
                    size="large" 
                    color="#1a86e4" 
                    :round="true"
                    class="practice-btn"
                    @click="HandleGoPractice">
                    立即练习
                </van-button>
            </div>
        </div>
    </div>
</van-config-provider>
</template>
<script setup>
import { useExamStore } from '@/stores/counter'
import { onMounted } from 'vue'
import TopBack from '@/components/FuntionComponents/TopBack.vue'
import {ref} from 'vue'
import Divider from '../FuntionComponents/Divider.vue'
import RouterPush from '@/util/RouterPush'
import { useRoute } from 'vue-router'

const questions = ref([])
const route = useRoute()
const store = useExamStore()
const IsshowAnswer = ref(true)
const IsRandom = ref(false)
const practiceCount = ref(1) // 修改为数字类型，设置默认值为1
const IsOPenAI = ref(true)

onMounted(() => {
    questions.value = store.getCurrentQuestion()// 获取当前题型的题目
    practiceCount.value = questions.value.length // 初始化为题目总数
})

// 处理立即练习逻辑
const HandleGoPractice = () => {
    const selectedQuestions = questions.value.slice(0, practiceCount.value)
    store.setSelectedQuestions(selectedQuestions)// 将选中的题目存储到store中
    store.setIsShowAnswer(IsshowAnswer.value)// 设置是否显示答案
    store.setIsRandom(IsRandom.value)// 设置题目顺序是否随机
    store.setIsOpenAI(IsOPenAI.value)// 设置是否开启AI解析助手
    RouterPush(`/PractisePage/${route.params.id}`)// 跳转到练习页面
}

const themeVars = ref({
    buttonIconSize:"32px"
})
</script>
<style scoped>
.info-group {
    margin: 12px 0;
    margin-left: 5px;
    margin-right: 5px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-cell {
    font-size: 16px;
    padding: 16px;
}

.info-cell :deep(.van-cell__title) {
    font-weight: 500;
    color: #333;
}

.info-cell :deep(.van-cell__value) {
    font-weight: 600;
    color: #1989fa;
}
.info-value {
    font-size: 15px;
    letter-spacing: 0.5px;
}
.custom-button {
    width: 40px;
    color: #fff;
    font-size: 15px;
    line-height: 20px;
    text-align: center;
    background-color: var(--van-primary-color);
    border-radius: 100px;
}
.settings-container {
    padding: 0 16px;
}

.set-group{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0;
    padding: 12px 16px;
    background-color: #f7f9fb;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.set-label {
    flex-shrink: 0;
    margin-right: 16px;
    font-size: 15px;
    color: #333;
    font-weight: 500;
}

.goexam-button {
    margin-top: 24px;
    padding: 0 16px;
}

.practice-btn {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    box-shadow: 0 4px 12px rgba(26, 134, 228, 0.3);
}

.icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.icon-wrapper .van-icon-success {
    line-height: 32px;
    color: var(--van-blue);
}

.icon-wrapper .van-icon-cross {
    line-height: 32px;
    color: var(--van-gray-5);
}
</style>