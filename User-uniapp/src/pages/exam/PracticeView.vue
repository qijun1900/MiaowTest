<template>
    <view>
        <!-- uView自定义导航栏 -->
        <u-navbar 
            bgColor="#F8F8F8" 
            :autoBack="true"
            rightIcon="more-dot-fill"
            @leftClick="leftClick">
            <template #center>
                <UviewSubsection 
                    :list="list" 
                    class="subsection-wrapper" 
                    @updateCurrent="handleSendMode"/>
            </template> 
        </u-navbar>
        
        <!-- 页面内容 -->
        <view 
            class="content" 
            :style="{ paddingTop: navBarHeight + 'px' }">
                <swiper
                    class="question-swiper"
                    :current="currentQuestionIndex"
                    @change="handleQuestionChange"
                    :duration="300">
                    <swiper-item 
                        v-for="(item,index) in questionStore.UserChooseQuestion" 
                        :key="index">
                        <view class="question-container">
                            <SelectQuestion 
                                v-if="item.Type===1" 
                                :question="item" 
                                :questionIndex="index + 1"
                                :currentMode="currentMode"
                                :key="refreshKey"/>
                            <BlankQuestion 
                                v-if="item.Type===2" 
                                :question="item" 
                                :questionIndex="index + 1"
                                :currentMode="currentMode"/>
                            <JudgeQuestion 
                                v-if="item.Type===3" 
                                :question="item" 
                                :questionIndex="index + 1" 
                                :currentMode="currentMode" 
                                :key="refreshKey"/>
                            <ShortQuestion 
                                v-if="item.Type===4" 
                                :question="item" 
                                :questionIndex="index + 1"
                                :currentMode="currentMode"
                                :key="refreshKey"/>
                        </view>
                    </swiper-item>
                </swiper>
        </view>
    </view>
</template>

<script setup>
import { onMounted, ref,  } from 'vue'; // 导入computed
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import UviewSubsection from "../../components/core/uviewSubsection.vue";
import SelectQuestion from '../../components/modules/exam/SelectQuestion.vue';//Type=1
import BlankQuestion from '../../components/modules/exam/BlankQuestion.vue';//Type=2
import JudgeQuestion from '../../components/modules/exam/JudgeQuestion.vue';//Type=3
import ShortQuestion from '../../components/modules/exam/ShortQuestion.vue';//Type=4
import { useObjectiveAnswerStore } from '../../stores/modules/ObjectiveAnswerStore';

const questionStore = useQuestionStore();
const list = ref(['答题模式', '学习模式']);// 添加subsection需要的数据
const currentMode = ref(0);// 当前选中的模式，0表示答题模式，1表示学习模式
const navBarHeight = ref(0); // 导航栏高度
const currentQuestionIndex = ref(0);// 当前选中的问题索引
const answerStore = useObjectiveAnswerStore();// AnswerStore
const refreshKey = ref(0);// 用于触发子组件刷新

// // 添加计算属性, 获取当前问题
// const currentQuestion = computed(() => {
//   return questionStore.UserChooseQuestion[currentQuestionIndex.value];
// });


const handleSendMode =(value)=>{
    currentMode.value = value; // 更新当前选中的模式
    console.log("当前模式:", currentMode.value === 0 ? "答题模式" : "学习模式");
}
// 处理滑动事件
const handleQuestionChange = (e) => {
    currentQuestionIndex.value = e.detail.current; // 更新当前选中的问题索引
}
// 处理右侧按钮点击事件
const leftClick = () => { 
    if(questionStore.UserShowSettings.showAnswer || questionStore.UserShowSettings.OptionRandom ){
        answerStore.clearAllAnswers();
        refreshKey.value++; // 触发所有题目组件刷新
        currentQuestionIndex.value = 0; // 回到第一题
        console.log("清除所有答案");
        uni.showToast({ 
        title: `当前开启${questionStore.UserShowSettings.showAnswer? '立即显示答案开启' : '选项乱序开启'}>>返回将清除所有答案`, 
        icon: 'none' ,
        duration:4000,
    });
    } 
};  


// 获取导航栏高度
const getNavBarHeight = () => {
    // #ifdef MP-WEIXIN 
    // 小程序端使用uni.getSystemInfoSync获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    navBarHeight.value = systemInfo.statusBarHeight + 44; // 状态栏高度 + 导航栏高度
    // #endif
    
    // #ifdef H5 
    // H5端使用固定值
    navBarHeight.value = 44; // 导航栏高度
    // #endif
}
onMounted(() => {
    getNavBarHeight();
    console.log(questionStore.UserChooseQuestion)
})
</script>

<style scoped>
.subsection-wrapper {
    width: 40%; /* 控制分段控制器的宽度 */
    margin: 0 auto; /* 居中显示 */
}

/* 新增内容区域高度和滚动 */
.content {
    /* 计算内容区高度，减去导航栏高度 */
    height: calc(100vh - 44px);
    position: relative;
    overflow-y: auto; /* 允许垂直滚动 */
    
}

.question-swiper {
    height: 100%;
    overflow-y: auto; /* 允许垂直滚动 */;
}
.question-container {
    height: 100%;
    overflow-y: auto;

}
</style>
