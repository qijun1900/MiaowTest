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
            :style="{ 
                paddingTop: navBarHeight + 'px',
                height: `calc(100vh - ${Math.max(navBarHeight, 44)}px - ${safeAreaBottom}px)`,
                minHeight: '300px' 
            }">
                <swiper
                    class="question-swiper"
                    :current="currentIndex"
                    @change="handleSwiperChange"
                    :duration="200"
                    :vertical="false"
                    :circular="true">
                    <swiper-item 
                        v-for="(itemIndex, i) in visibleIndexes" 
                        :key="`${itemIndex}-${questionStore.UserChooseQuestion[itemIndex]?._id || i}`">
                        <view class="question-container">
                            <SelectQuestion 
                                v-if="questionStore.UserChooseQuestion[itemIndex]?.Type===1" 
                                :question="questionStore.UserChooseQuestion[itemIndex]" 
                                :questionIndex="itemIndex + 1"
                                :currentMode="currentMode"
                                :key="`select-${questionStore.UserChooseQuestion[itemIndex]?._id || itemIndex}-${refreshKey}`"/>
                            <BlankQuestion 
                                v-if="questionStore.UserChooseQuestion[itemIndex]?.Type===2" 
                                :question="questionStore.UserChooseQuestion[itemIndex]" 
                                :questionIndex="itemIndex + 1"
                                :currentMode="currentMode"
                                :key="`blank-${questionStore.UserChooseQuestion[itemIndex]?._id || itemIndex}-${refreshKey}`"/>
                            <JudgeQuestion 
                                v-if="questionStore.UserChooseQuestion[itemIndex]?.Type===3" 
                                :question="questionStore.UserChooseQuestion[itemIndex]" 
                                :questionIndex="itemIndex + 1" 
                                :currentMode="currentMode" 
                                :key="`judge-${questionStore.UserChooseQuestion[itemIndex]?._id || itemIndex}-${refreshKey}`"/>
                            <ShortQuestion 
                                v-if="questionStore.UserChooseQuestion[itemIndex]?.Type===4" 
                                :question="questionStore.UserChooseQuestion[itemIndex]" 
                                :questionIndex="itemIndex + 1"
                                :currentMode="currentMode"
                                :key="`short-${questionStore.UserChooseQuestion[itemIndex]?._id || itemIndex}-${refreshKey}`"/>
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
            <!-- 答题卡  -->
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
                            <!-- 添加支持手势滑动的容器 -->
                            <scroll-view 
                                class="answer-sheet-scroll" 
                                scroll-y="true"
                                :scroll-top="scrollTop"
                                :enhanced="true"
                                :show-scrollbar="false">
                                <view class="answer-sheet">
                                    <AnswerSheet
                                        :questions="questionStore.UserChooseQuestion" 
                                        :currentIndex="visibleIndexes[currentIndex]"
                                        @question-click="handleQuestionCardClick"
                                        :isShowAnswer="questionStore.UserShowSettings.showAnswer"/>
                                </view>
                            </scroll-view>
                       </view>
                    </template>
            </uviewPopup>
        <!-- 答题助手 -->
        <dragButton
            :isDock="true"
			:existTabBar="true"
            iconType='plusempty'
            @btnClick="handleBtnClick"
            :bottomOffset="150"
            :horizontal="'right'" 
            :vertical="'top'" 
            :direction="'horizontal'"
            :popMenu="true"
            :content="[
                { text: '设置', iconType: 'gear' ,value:0 },
                { text: '笔记', iconType: 'compose'  ,value:1 },
                { text: '收藏', iconType: currenIsFavorited ? 'star-filled':'star' ,value:2 }
            ]"
            @menuItemClick="handleMenuClick"/>
        <!-- 笔记弹窗 -->
        <uviewPopup
            v-model:show="iSopenNotePopupShow"
            :closeable="false"
            :round="30"
            :closeOnClickOverlay="false"
            title="添加题目笔记" >
                <template #popupcontent>
                    <view class="note-popup-container">
                        <view class="note-editor-wrapper">
                            <uniEditor 
                                placeholder="请在此处输入笔记内容..." 
                                v-model="noteContent" 
                                height="300rpx" 
                                id="noteEditor"
                                :focus="iSopenNotePopupShow"/>
                        </view>
                        <view 
                            class="note-info" 
                            v-if="lastSavedTime">
                            <text class="note-info-text">上次保存: {{ formatTime.getTime2(lastSavedTime) }}</text>
                        </view>
                        <view class="note-button-container">
                            <up-button
                                :plain="true"
                                :hairline="true"
                                type="info"
                                @click="handleCancelNote"
                                size="small"
                                shape="circle">
                                取消
                            </up-button>
                            <up-button
                                :loading="isSavingNote"
                                :disabled="!noteContent.trim()"
                                type="primary"
                                @click="handleSaveNote"
                                size="small"
                                shape="circle">
                                保存
                            </up-button>
                        </view>
                    </view>
                </template>
        </uviewPopup>
    </view>
</template>
<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
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
import dragButton from '../../components/plug-in/drag-button/drag-button.vue';
import { 
    checkFavoriteQuestionAPI,
    addFavoriteQuestionAPI,
    deleteFavoriteQuestionAPI,
    savePracticeNoteAPI,
    getPracticeNoteAPI
} from '../../API/Exam/QuestionAPI';
import checkLogin from '../../util/checkLogin';
import uniEditor from '../../components/core/uniEditor.vue'
import formatTime from '../../util/formatTime';

const questionStore = useQuestionStore();// 问题Store,存储问题和用户设置
const list = ref(['答题模式', '学习模式']);// 添加subsection需要的数据
const currentMode = ref(0);// 当前选中的模式，0表示答题模式，1表示学习模式
const navBarHeight = ref(0); // 导航栏高度
const safeAreaBottom = ref(0); // 底部安全区域高度
const currentIndex = ref(0); // 当前显示项的索引
const visibleIndexes = ref([0, 1, 2]); // 当前可见的三个项目索引
const ObjectiveAnswerStore = useObjectiveAnswerStore();// 客观题答案Store
const SubjectiveAnswerStore = useSubjectiveAnswerStore();// 主观题答案Store
const refreshKey = ref(0);// 用于触发子组件刷新
const popupShow = ref(false);//答题卡弹窗
const StatisticsStore = useStatisticsStore();// 统计答题数据Store
const { correctCount, incorrectCount, accuracyRate } = storeToRefs(StatisticsStore);
const scrollTop = ref(0); // 用于控制scroll-view的滚动位置
const bankInfo = ref(null); // 题库信息
const currentQuestionId = ref(null); // 当前问题的ID
const currenIsFavorited = ref(false); // 当前问题是否收藏
const currenQuestionType = ref(null); // 当前问题的类型
const iSopenNotePopupShow = ref(false);// 笔记弹窗
const noteContent = ref('');// 笔记内容
const isSavingNote = ref(false);// 笔记保存状态
const lastSavedTime = ref('');// 上次保存时间
const originalNoteContent = ref('');// 原始笔记内容，用于取消操作

const handleBtnClick = async() => {
    const loginResult = await checkLogin();
    if (!loginResult) {
        return;
    }
    if (currentQuestionId.value) {
       const result = await checkFavoriteQuestionAPI(currentQuestionId.value);
       if(result.code===200){
        currenIsFavorited.value  = result.isFavorited 
       }
    }
}

const handleMenuClick = async (item) => {
    if(item.value===2 && currentQuestionId.value && !currenIsFavorited.value){
        // 收藏当前问题
        const res = await addFavoriteQuestionAPI(
            currentQuestionId.value, // 当前问题ID
            bankInfo.value.bankId, // 考试ID
            currenQuestionType.value // 问题类型   
        );
        if (res.code === 200) {
            currenIsFavorited.value = true; // 更新收藏状态
            uni.showToast({
                title: '收藏成功',
                icon: 'none'
            });
            return;
        }
    }
    if(item.value===2 && currentQuestionId.value && currenIsFavorited.value){
        // 取消收藏当前问题
        const res = await deleteFavoriteQuestionAPI(
            currentQuestionId.value, 
        );
        if (res.code === 200) {
            currenIsFavorited.value = false; // 更新收藏状态
            uni.showToast({
                title: '取消收藏',
                icon: 'none'
            });
            return;
        }
    }
    if(item.value===1 && currentQuestionId.value && !iSopenNotePopupShow.value){
        // 打开笔记弹窗
        iSopenNotePopupShow.value = true;
        // 重置保存状态
        isSavingNote.value = false;
        
        // 加载已有的笔记(检测是否有笔记)
        const res = await getPracticeNoteAPI(currentQuestionId.value);
        if (res.code === 200 && res.data.hasNote) {
            noteContent.value = res.data.note.content; // 加载笔记内容
            lastSavedTime.value = res.data.note.updateTime; // 加载上次保存时间
        }else{
            noteContent.value = ''; // 清空笔记内容
        }
        
        // 保存原始内容，用于取消操作
        originalNoteContent.value = noteContent.value;
    }
    if(item.value===0){
        // 打开设置
        uni.navigateTo({
            url: `/pages/public/feedbackview`
        });    
    }
}
const handleSaveNote = async () => {
    // 保存笔记
    if (!currentQuestionId.value || !noteContent.value.trim()) {
        uni.showToast({
            title: '请输入笔记内容',
            icon: 'none'
        });
        return;
    }
    
    // 设置保存状态
    isSavingNote.value = true;
    
    try {
        // 调用API保存笔记
        const res = await savePracticeNoteAPI({
            questionId: currentQuestionId.value, // 问题ID
            questionType: currenQuestionType.value, // 问题类型
            examId: bankInfo.value.bankId, // 考试ID
            content: noteContent.value, // 笔记内容
        });
        
        if (res.code === 200) {
            // 更新原始内容
            originalNoteContent.value = noteContent.value;
            
            uni.showToast({
                title: res.message || '笔记保存成功',
                icon: 'success'
            });
            
            // 延迟关闭弹窗，让用户看到保存成功的提示
            setTimeout(() => {
                iSopenNotePopupShow.value = false; // 关闭笔记弹窗
            }, 800);
        } else {
            uni.showToast({
                title: res.message || '保存失败',
                icon: 'none'
            });
        }
    } catch (error) {
        console.error('保存笔记失败:', error);
        uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
        });
    } finally {
        isSavingNote.value = false;
    }
}

// 取消笔记编辑
const handleCancelNote = () => {
    // 如果内容有变化，提示用户
    if (noteContent.value !== originalNoteContent.value) {
        uni.showModal({
            title: '提示',
            content: '您有未保存的更改，确定要关闭吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    // 恢复原始内容
                    noteContent.value = originalNoteContent.value;
                    iSopenNotePopupShow.value = false;
                }
            }
        });
    } else {
        // 直接关闭
        iSopenNotePopupShow.value = false;
    }
}


// 页面加载时接收参数
onLoad((options) => {
  if (options.bankInfo) {
    try {
      bankInfo.value = JSON.parse(decodeURIComponent(options.bankInfo));
    } catch (error) {
      console.error('解析题库信息失败:', error);
    }
  }
});

// 监听当前索引变化
watch(currentIndex, (newIndex, oldIndex) => {
    // 处理滑动方向变化
    handleDirectionChange(newIndex, oldIndex);
    // 更新当前问题ID
    updateCurrentQuestionId();
});

// 监听visibleIndexes变化
watch(visibleIndexes, () => {
    // 更新当前问题ID
    updateCurrentQuestionId();
}, { deep: true });

// 更新当前问题ID的函数
const updateCurrentQuestionId = () => {
    const currentQuestionIndex = visibleIndexes.value[currentIndex.value];
    if (currentQuestionIndex !== undefined && questionStore.UserChooseQuestion[currentQuestionIndex]) {
        currentQuestionId.value = questionStore.UserChooseQuestion[currentQuestionIndex]._id; // 更新当前问题ID
        currenQuestionType.value = questionStore.UserChooseQuestion[currentQuestionIndex].Type; // 更新当前问题的类型
    }
};

//选择模式
const handleSendMode =(value)=>{
    currentMode.value = value; // 更新当前选中的模式
}

// 处理轮播切换事件
const handleSwiperChange = (event) => {
    // 延迟更新索引，避免与swiper动画冲突
    setTimeout(() => {
        currentIndex.value = event.detail.current;
    }, 60);
}

// 处理滑动方向变化
const handleDirectionChange = (newIndex, oldIndex) => {
    // 判断滑动方向：true为左滑，false为右滑
    const isLeftSwipe = 
        (newIndex > oldIndex && !(newIndex === 2 && oldIndex === 0)) || 
        (newIndex === 0 && oldIndex === 2);
    
    // 延迟处理，等待swiper动画完成
    setTimeout(() => {
        isLeftSwipe ? handleLeftSwipe() : handleRightSwipe();
    }, 100);
}

// 处理向左滑动（下一个）
const handleLeftSwipe = () => {
    const currentListIndex = visibleIndexes.value[currentIndex.value];
    
    // 计算下一个要显示的项目索引
    const nextListIndex = currentListIndex + 1;
    
    // 边界检查
    if (nextListIndex < questionStore.UserChooseQuestion.length) {
        // 创建新的可见索引数组
        const newVisibleIndexes = [...visibleIndexes.value];
        
        // 计算当前swiper-item位置
        const currentSwiperIndex = currentIndex.value;
        
        // 计算下一个swiper-item位置
        const nextSwiperIndex = (currentSwiperIndex + 1) % 3;
        
        // 只有当新索引与当前不同时才更新
        if (newVisibleIndexes[nextSwiperIndex] !== nextListIndex) {
            // 更新下一个位置的题目索引
            newVisibleIndexes[nextSwiperIndex] = nextListIndex;
            
            // 更新visibleIndexes
            visibleIndexes.value = newVisibleIndexes;
            
            // 延迟触发组件重新渲染，确保动画完成
            setTimeout(() => {
                refreshKey.value++;
            }, 50);
        }
    } else {
        // 到达列表末尾，使用更平滑的提示
        uni.showToast({
            title: '已经是最后一题',
            icon: 'none',
            duration: 1000
        });
    }
}

// 处理向右滑动（上一个）
const handleRightSwipe = () => {
    const currentListIndex = visibleIndexes.value[currentIndex.value];
    
    // 计算上一个要显示的项目索引
    const prevListIndex = currentListIndex - 1;
    
    // 边界检查
    if (prevListIndex >= 0) {
        // 创建新的可见索引数组
        const newVisibleIndexes = [...visibleIndexes.value];
        
        // 计算当前swiper-item位置
        const currentSwiperIndex = currentIndex.value;
        
        // 计算上一个swiper-item位置
        const prevSwiperIndex = (currentSwiperIndex + 2) % 3;
        
        // 只有当新索引与当前不同时才更新
        if (newVisibleIndexes[prevSwiperIndex] !== prevListIndex) {
            // 更新上一个位置的题目索引
            newVisibleIndexes[prevSwiperIndex] = prevListIndex;
            
            // 更新visibleIndexes
            visibleIndexes.value = newVisibleIndexes;
            
            // 延迟触发组件重新渲染，确保动画完成
            setTimeout(() => {
                refreshKey.value++;
            }, 50);
        }
    } else {
        // 到达列表开头，使用更平滑的提示
        uni.showToast({
            title: '已经是第一题',
            icon: 'none',
            duration: 1000
        });
    }
}

// 处理右侧按钮点击事件
const leftClick = () => { 
    SubjectiveAnswerStore.clearAllAnswers();
    ObjectiveAnswerStore.clearAllAnswers();
}; 

// 处理答题卡 Popup 显示
const handleCheck = () => {
   popupShow.value = true;
}

// 处理答题卡点击
const handleQuestionCardClick = (index) => {
    // 计算点击的题目与当前题目的差值
    const currentQuestionIndex = visibleIndexes.value[currentIndex.value];
    const diff = index - currentQuestionIndex;
    
    if (diff === 0) {
        // 点击当前题目，关闭弹窗即可
        popupShow.value = false;
        return;
    }
    
    // 直接更新visibleIndexes数组，根据点击的题目重新计算三个可见项
    const totalQuestions = questionStore.UserChooseQuestion.length;
    
    // 计算新的可见索引范围
    let newVisibleIndexes = [];
    let newCurrentIndex = 0;
    
    // 确保点击的题目在可见范围内
    if (totalQuestions <= 3) {
        // 如果题目总数不超过3，显示所有题目
        newVisibleIndexes = Array.from({ length: totalQuestions }, (_, i) => i);
        // 设置currentIndex为点击的题目索引
        newCurrentIndex = index;
    } else {
        // 题目总数大于3，需要计算显示范围
        // 确保点击的题目在可见范围内，并尽量保持居中显示
        
        // 计算起始索引，确保点击的题目在可见范围内
        let startIndex = index - 1; // 尝试让点击的题目居中显示
        
        // 边界检查
        if (startIndex < 0) startIndex = 0;// 确保起始索引不小于0
        if (startIndex > totalQuestions - 3) startIndex = totalQuestions - 3;// 确保不会超出索引范围
        
        // 生成新的可见索引数组
        newVisibleIndexes = [startIndex, startIndex + 1, startIndex + 2];
        
        // 计算点击的题目在可见数组中的位置
        if (index === startIndex) {
            newCurrentIndex = 0;
        } else if (index === startIndex + 1) {
            newCurrentIndex = 1;
        } else {
            newCurrentIndex = 2;
        }
    }
    
    // 关闭弹窗
    popupShow.value = false;
    
    // 延迟更新索引，确保弹窗关闭动画完成
    setTimeout(() => {
        // 更新visibleIndexes
        visibleIndexes.value = newVisibleIndexes;
        
        // 更新currentIndex
        currentIndex.value = newCurrentIndex;
        
        // 延迟触发组件重新渲染，确保动画完成
        setTimeout(() => {
            refreshKey.value++;
        }, 50);
    }, 300);
}

// 处理清空答案
const handleCleanAnswer = () => {
    uni.showModal({
        title: '提示',
        content: '确定要清空本次记录吗？',
        confirmColor: '#FF0000', // 设置确认按钮颜色为红色
        confirmText: '清空', // 设置确认按钮文本为"清空"
        cancelText: '取消', // 设置取消按钮文本为"取消"
        success: (res) => {
            if (res.confirm) {
                SubjectiveAnswerStore.clearAllAnswers();
                ObjectiveAnswerStore.clearAllAnswers();
                popupShow.value = false;
                refreshKey.value++
                uni.showToast({
                    title: '作答已清空',
                    icon: 'none'
                });
            }
        },
    });
}

//当最后一题时候显示提交按钮
const isEndQuestion = computed(() => {
    const currentQuestionIndex = visibleIndexes.value[currentIndex.value];
    if(currentQuestionIndex === questionStore.UserChooseQuestion.length - 1 && currentMode.value === 0){
        return true;
    }else{  
        return false;
    }
});

// 处理提交答案
const handleSubmitAnswer = () => {
    popupShow.value = false;
    
    // 延迟跳转，确保弹窗关闭动画完成
    setTimeout(() => {
        // 构建URL，传递题库信息
        let url = '/pages/exam/PracticeResultsView';
        if (bankInfo.value) {
            url += `?bankInfo=${encodeURIComponent(JSON.stringify(bankInfo.value))}`;
        }
        uni.navigateTo({
            url: url
        });
    }, 300);
}

onMounted(() => {
   const navInfo = navBarHeightUtil.getNavBarInfo();
   navBarHeight.value = navInfo.totalHeight;
   
   // 获取安全区域信息
   const safeAreaInfo = navBarHeightUtil.getSafeAreaInfo();
   safeAreaBottom.value = safeAreaInfo.bottom;
   
   // 检查是否有题目数据，如果没有则返回上一页
   if (
    !questionStore.UserChooseQuestion 
    || questionStore.UserChooseQuestion.length === 0) {
     uni.showToast({
       title: '没有题目数据',
       icon: 'none'
     });
     setTimeout(() => {
       uni.navigateBack();
     }, 1500);
     return;
   }
   
   // 初始化虚拟化渲染所需的索引
   const questionCount = questionStore.UserChooseQuestion.length;
   if (questionCount >= 3) {
     visibleIndexes.value = [0, 1, 2];
   } else {
    // 如果题目少于3道，则只显示实际数量的题目
    visibleIndexes.value = Array.from({ length: questionCount }, (_, i) => i);
   }
   
   // 初始化当前问题ID
   updateCurrentQuestionId();
})
</script>

<style scoped>
.subsection-wrapper {
    width: 40%; /* 控制分段控制器的宽度 */
    margin: 0 auto; /* 居中显示 */
}

/* 新增内容区域高度和滚动 */
.content {
    /* 高度通过内联样式动态设置 */
    position: relative;
    overflow-y: auto; /* 允许垂直滚动 */
    display: flex;  /* 使用flex布局 */
    flex-direction: column; /* 垂直方向布局 */
    box-sizing: border-box; /* 确保padding不影响总高度 */
}

.question-swiper {
    height: 100%;
    flex: 1; /* 使用flex占满剩余空间 */
    overflow: hidden; /* 防止滚动条重复 */
    transition: all 0.3s ease; /* 添加过渡效果 */
    /* 添加硬件加速 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    /* 开启GPU加速 */
    will-change: transform;
}
.question-container {
    height: 100%;
    overflow-y: auto;
    padding: 10rpx; /* 添加适当内边距 */
    box-sizing: border-box; /* 确保padding不影响总高度 */
    -webkit-overflow-scrolling: touch; /* 添加弹性滚动 */
    /* 添加平滑滚动 */
    scroll-behavior: smooth;
    /* 优化渲染性能 */
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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

/* 笔记弹窗样式 */
.note-popup-container {
    padding: 10rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.note-editor-wrapper {
    border-radius: 12rpx;
    overflow: hidden;
    border: 1px solid #eee;
}

.note-info {
    display: flex;
    justify-content: flex-end;
    padding: 0 10rpx;
}

.note-info-text {
    font-size: 24rpx;
    color: #999;
}

.note-button-container {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
}
.answer-sheet-scroll {
    max-height: 500rpx;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* 添加弹性滚动 */
}
.answer-sheet{
    padding: 10rpx 10rpx;
    background-color: #ffffff;
    border-radius: 28rpx;
    margin-top: 20rpx;
    overflow-y: auto;
}
</style>