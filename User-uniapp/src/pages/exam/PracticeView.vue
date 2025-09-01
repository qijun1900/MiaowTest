<template>
    <view>
        <!-- uView自定义导航栏 -->
        <u-navbar 
            title="" 
            bgColor="#F8F8F8" 
            :autoBack="true">
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
                        <SelectQuestion v-if="item.Type===1"/>
                        <BlankQuestion v-if="item.Type===2"/>
                        <JudgeQuestion v-if="item.Type===3"/>
                        <ShortQuestion v-if="item.Type===4"/>
                    </view>
                    </swiper-item>
                </swiper>
        </view>
    </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import UviewSubsection from "../../components/core/uviewSubsection.vue";
import SelectQuestion from '../../components/modules/exam/SelectQuestion.vue';//Type=1
import BlankQuestion from '../../components/modules/exam/BlankQuestion.vue';//Type=2
import JudgeQuestion from '../../components/modules/exam/JudgeQuestion.vue';//Type=3
import ShortQuestion from '../../components/modules/exam/ShortQuestion.vue';//Type=4


const questionStore = useQuestionStore();
const list = ref(['答题模式', '学习模式']);// 添加subsection需要的数据
const currentMode = ref(0);// 当前选中的模式，0表示答题模式，1表示学习模式
const navBarHeight = ref(0); // 导航栏高度
const currentQuestionIndex = ref(0);// 当前选中的问题索引

const handleSendMode =(value)=>{
    currentMode.value = value; // 更新当前选中的模式
}
// 处理滑动事件
const handleQuestionChange = (e) => {
    currentQuestionIndex.value = e.detail.current; // 更新当前选中的问题索引
    console.log(currentQuestionIndex.value)// 输出当前选中的问题索引
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
   console.log( questionStore.UserChooseQuestion)
   getNavBarHeight();
})
</script>

<style scoped>
.subsection-wrapper {
    width: 40%; /* 控制分段控制器的宽度 */
    margin: 0 auto; /* 居中显示 */
}
.content {
    height: 100vh; /* 设置页面高度 */
    overflow: hidden; /* 禁用滚动 */
    box-sizing: border-box; /* 包含padding在高度内 */
}
</style>