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
                                :currentMode="currentMode"/>
                        </view>
                    </swiper-item>
                </swiper>
                <uni-transition :show="isEndQuestion" mode="fade">
                    <view class="but-container">
                        <up-button 
                            @click="handleSubmitAnswer"
                            type="primary" 
                            shape="circle" 
                            icon="checkbox-mark"
                            :plain="true"
                            :hairline="false">
                            提交答案
                        </up-button>
                    </view>
                </uni-transition>
        </view> 
        <!-- 自定义底部 -->
        <view class="bottom">
            <up-tabbar
            :border="true"
            :fixed="true"
            :placeholder="true"
            :safeAreaInsetBottom="true"
            backgroundColor="#f2f2f2"
            zIndex="10">
            <up-tabbar-item 
                :text="String(correctCount)" 
                icon="/static/other/right.png" 
                v-show="questionStore.UserShowSettings.showAnswer && currentMode===0"></up-tabbar-item>
            <up-tabbar-item 
                :text="String(incorrectCount)" 
                icon="/static/other/error.png" 
                v-show="questionStore.UserShowSettings.showAnswer && currentMode===0"></up-tabbar-item>
            <up-tabbar-item 
                :text="String(accuracyRate)" 
                icon="/static/other/percent.png" 
                v-show="questionStore.UserShowSettings.showAnswer && currentMode===0"></up-tabbar-item>
            <up-tabbar-item 
                text="答题卡" 
                icon="list-dot" 
                @click="handleCheck"></up-tabbar-item>
        </up-tabbar>
        </view>
    </view>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'; // 导入computed
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import UviewSubsection from "../../components/core/uviewSubsection.vue";
import SelectQuestion from '../../components/modules/exam/SelectQuestion.vue';//Type=1
import BlankQuestion from '../../components/modules/exam/BlankQuestion.vue';//Type=2
import JudgeQuestion from '../../components/modules/exam/JudgeQuestion.vue';//Type=3
import ShortQuestion from '../../components/modules/exam/ShortQuestion.vue';//Type=4
import { useObjectiveAnswerStore } from '../../stores/modules/ObjectiveAnswerStore';
import { useSubjectiveAnswerStore } from '../../stores/modules/SubjectiveAnswerStore';

const questionStore = useQuestionStore();
const list = ref(['答题模式', '学习模式']);// 添加subsection需要的数据
const currentMode = ref(0);// 当前选中的模式，0表示答题模式，1表示学习模式
const navBarHeight = ref(0); // 导航栏高度
const currentQuestionIndex = ref(0);// 当前选中的问题索引
const ObjectiveAnswerStore = useObjectiveAnswerStore();// AnswerStore
const SubjectiveAnswerStore = useSubjectiveAnswerStore();// 主观题答案Store
const refreshKey = ref(0);// 用于触发子组件刷新

// 计算答对次数
const correctCount = computed(() => {
    // 客观题答对次数
    let objectiveCorrect = 0;
    ObjectiveAnswerStore.answeredQuestions.forEach(questionId => {
        if (ObjectiveAnswerStore.getIsAnswerCorrect(questionId)) {
            objectiveCorrect++;
        }
    });
    
    // 主观题自评正确次数
    let subjectiveCorrect = 0;
    SubjectiveAnswerStore.answeredQuestions.forEach(questionId => {
        if (SubjectiveAnswerStore.getUserSelfEvaluation(questionId)) {
            subjectiveCorrect++;
        }
    });
    
    return objectiveCorrect + subjectiveCorrect;
});

// 计算答错次数
const incorrectCount = computed(() => {
    // 客观题答错次数
    let objectiveIncorrect = 0;
    ObjectiveAnswerStore.answeredQuestions.forEach(questionId => {
        if (!ObjectiveAnswerStore.getIsAnswerCorrect(questionId)) {
            objectiveIncorrect++;
        }
    });
    
    // 主观题自评错误次数
    let subjectiveIncorrect = 0;
    SubjectiveAnswerStore.answeredQuestions.forEach(questionId => {
        if (SubjectiveAnswerStore.getUserSelfEvaluation(questionId) === false) {
            subjectiveIncorrect++;
        }
    });
    
    return objectiveIncorrect + subjectiveIncorrect;
});

// 计算正确率
const accuracyRate = computed(() => {
    const totalAnswered = correctCount.value + incorrectCount.value;
    if (totalAnswered === 0) return 0;
    
    // 保留一位小数
    return Math.round((correctCount.value / totalAnswered) * 1000) / 10;
});

//选择模式
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
    // if(questionStore.UserShowSettings.showAnswer || questionStore.UserShowSettings.OptionRandom ){
    //     ObjectiveAnswerStore.clearAllAnswers();
    //     SubjectiveAnswerStore.clearAllAnswers();
    //     refreshKey.value++; // 触发所有题目组件刷新
    //     currentQuestionIndex.value = 0; // 回到第一题
    //     uni.showToast({ 
    //     title: `当前开启${questionStore.UserShowSettings.showAnswer? '立即显示答案开启' : '选项乱序开启'}>>返回将清除选择判断做题痕迹`, 
    //     icon: 'none' ,
    //     duration:4000,
    // });
    // } 
    console.log( "清除");
}
// 处理答题卡
const handleCheck = () => {
   console.log("答题卡")
}

//当最后一题时候显示提交按钮
const isEndQuestion = computed(() => {
    if(currentQuestionIndex.value === questionStore.UserChooseQuestion.length - 1 && currentMode.value === 0){
        console.log("最后一题");
        return true;
    }else{  
        return false;
    }
});

//handleSubmitAnswer
const handleSubmitAnswer = () => {
    console.log("提交答案");
    uni.navigateTo({
        url: '/pages/exam/PracticeResultsView' 
    })
}


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
    display: flex;  /* 使用flex布局 */
    flex-direction: column; /* 垂直方向布局 */
    
}

.question-swiper {
    height: 100%;
    overflow-y: auto; /* 允许垂直滚动 */;
}
.question-container {
    height: 100%;
    overflow-y: auto;
}
.but-container{
    z-index: 100;
    position: fixed;
    bottom: 200rpx;
    width: 90%;
    left: 6%;
}
</style>