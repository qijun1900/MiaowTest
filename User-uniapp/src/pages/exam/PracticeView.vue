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
                v-if="questionStore.UserShowSettings.showAnswer && currentMode===0"></up-tabbar-item>
            <up-tabbar-item 
                :text="String(incorrectCount)" 
                icon="/static/other/error.png" 
                v-if="questionStore.UserShowSettings.showAnswer && currentMode===0"></up-tabbar-item>
            <up-tabbar-item 
                :text="String(accuracyRate)" 
                icon="/static/other/percent.png" 
                v-if="questionStore.UserShowSettings.showAnswer && currentMode===0"></up-tabbar-item>
            <up-tabbar-item 
                text="答题卡" 
                icon="list-dot" 
                @click="handleCheck"></up-tabbar-item>
            </up-tabbar>
        </view>
        <!-- popup  -->
            <uviewPopup 
                v-model:show="popupShow"
                :round="30" 
                title="答题卡" >
                    <template #popupcontent>
                        <view class="popup-container">
                            <view class="popup-but-container">
                                <up-button
                                    :plain="true" 
                                    :hairline="true" 
                                    type="primary"
                                    @click="handleCleanAnswer"
                                    shape="circle">
                                    清空本次记录
                                </up-button>
                                <up-button
                                    :plain="true" 
                                    :hairline="true" 
                                    type="primary"
                                    @click="handleSubmitAnswer"
                                    shape="circle">
                                    查看练习成绩
                                </up-button>
                            </view>
                            <view class="answer-sheet">
                                <AnswerSheet
                                    :questions="questionStore.UserChooseQuestion" 
                                    :currentIndex="currentQuestionIndex"
                                    @question-click="handleQuestionCardClick"
                                    :isShowAnswer="questionStore.UserShowSettings.showAnswer"/>
                            </view>
                       </view>
                    </template>
            </uviewPopup>
    </view>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue'; // 导入Vue的核心功能
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import UviewSubsection from "../../components/core/uviewSubsection.vue";
import SelectQuestion from '../../components/modules/exam/SelectQuestion.vue';//Type=1
import BlankQuestion from '../../components/modules/exam/BlankQuestion.vue';//Type=2
import JudgeQuestion from '../../components/modules/exam/JudgeQuestion.vue';//Type=3
import ShortQuestion from '../../components/modules/exam/ShortQuestion.vue';//Type=4
import { useObjectiveAnswerStore } from '../../stores/modules/ObjectiveAnswerStore';
import { useSubjectiveAnswerStore } from '../../stores/modules/SubjectiveAnswerStore';
import uviewPopup from '../../components/core/uviewPopup.vue';
import AnswerSheet from '../../components/modules/exam/AnswerSheet.vue';
import { useStatisticsStore } from '../../stores/modules/StatisticsStore';
import { storeToRefs } from 'pinia'; // 从Pinia导入storeToRefs
import navBarHeightUtil from '../../util/navBarHeight';

const questionStore = useQuestionStore();// 问题Store,存储问题和用户设置
const list = ref(['答题模式', '学习模式']);// 添加subsection需要的数据
const currentMode = ref(0);// 当前选中的模式，0表示答题模式，1表示学习模式
const navBarHeight = ref(0); // 导航栏高度
const currentQuestionIndex = ref(0);// 当前选中的问题索引
const ObjectiveAnswerStore = useObjectiveAnswerStore();// 客观题答案Store
const SubjectiveAnswerStore = useSubjectiveAnswerStore();// 主观题答案Store
const refreshKey = ref(0);// 用于触发子组件刷新
const popupShow = ref(false);// 弹窗
const StatisticsStore = useStatisticsStore();// 统计答题数据Store
const { correctCount, incorrectCount, accuracyRate } = storeToRefs(StatisticsStore);

//选择模式
const handleSendMode =(value)=>{
    currentMode.value = value; // 更新当前选中的模式
}

// 处理滑动事件
const handleQuestionChange = (e) => {
    currentQuestionIndex.value = e.detail.current; // 更新当前选中的问题索引
}

// 处理右侧按钮点击事件
const leftClick = () => { 
    SubjectiveAnswerStore.clearAllAnswers();
    ObjectiveAnswerStore.clearAllAnswers();
};  

// 处理清空答案
const handleCleanAnswer = () => {
    SubjectiveAnswerStore.clearAllAnswers();
    ObjectiveAnswerStore.clearAllAnswers();
    popupShow.value = false;
    refreshKey.value++
}

// 处理答题卡 Popup 显示
const handleCheck = () => {
   popupShow.value = true;
   
}

// 处理答题卡点击
const handleQuestionCardClick = (index) => {
    currentQuestionIndex.value = index; // 更新当前选中的问题索引
}

//当最后一题时候显示提交按钮
const isEndQuestion = computed(() => {
    if(currentQuestionIndex.value === questionStore.UserChooseQuestion.length - 1 && currentMode.value === 0){
        return true;
    }else{  
        return false;
    }
});

//handleSubmitAnswer
const handleSubmitAnswer = () => {
    console.log("提交答案");
    popupShow.value = false;
    uni.navigateTo({
        url: '/pages/exam/PracticeResultsView' 
    })
}



onMounted(() => {
   navBarHeightUtil.getNavBarInfo()
   console.log(navBarHeightUtil.getNavBarInfo().totalHeight);
   navBarHeight.value = navBarHeightUtil.getNavBarInfo().totalHeight;
    
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
.popup-container{
    padding: 0px 5rpx;
}
.popup-but-container{
    display: flex; /* 使用flex布局 */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    gap: 20rpx; /* 添加按钮之间的间距 */
}
.answer-sheet{
    padding: 10rpx 10rpx;
    background-color: #ffffff;
    border-radius: 28rpx;
    margin-top: 20rpx;
}
</style>