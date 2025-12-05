<template>
    <view class="question-container">
        <view class="question-header">
            <view class="question-top-row">
                <text class="question-index">{{props.questionIndex}}.</text>
                <text class="question-lable">简答题</text>
            </view>
            <view class="question-stem">
            <text v-if="!enableWordQuery || !processedStem" @longpress="handleLongPress">{{question.stem}}</text>
            <view v-else class="word-container" @longpress="handleLongPress">
                <text 
                    v-for="(word, index) in processedStem" 
                    :key="index"
                    class="word-item"
                    @tap="handleWordClick(word)"
                    :class="{ 'word-highlight': selectedWord === word }"
                >{{word}}</text>
            </view>
        </view>
        </view>
        <view class="input-container" v-show="props.currentMode === 0">
            <view class="input-label">
                <uni-icons
                    color="#3797ff" 
                    type="compose" 
                    size="20">
                </uni-icons>
            </view>
            <view class="input-textarea">
            <up-textarea 
                v-model="userinput" 
                placeholder="请在此处输入答案~"
                autoHeight 
                :height="75"
                count
                :maxlength="-1">
            </up-textarea>
            </view>
        </view>
        <!-- 查看答案 -->
        <view class="check-container">
            <up-button 
                v-if="props.currentMode === 0"
                @click="isShowAnswer = !isShowAnswer"
                type="primary" 
                :text= "showAnswerComputed ? '隐藏答案' : '显示答案'"
                shape="circle" 
                :icon="showAnswerComputed? 'eye-off':'eye-fill'">
            </up-button>
        </view>
        <!-- 答案 -->
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed">
            <view class="question-answer-container" key="answer">
                <view  class="answer-label">答案：</view>
                <view class="answer-content">
                    <rich-text :nodes="question.content"></rich-text>
                </view>
            </view>
        </uni-transition>
        <!-- 用户判断 -->
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed && props.currentMode === 0">
            <view class="user-judgment-container" key="judgment">
                <up-button 
                    icon="close-circle-fill"
                    type="primary" 
                    :plain="true" 
                    text="答错了" 
                    shape="circle" 
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(false)"></up-button>
                <up-button 
                    icon="checkmark-circle-fill"
                    type="primary" 
                    :plain="true" 
                    text="答对了" 
                    shape="circle" 
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(true)"></up-button>
            </view>
        </uni-transition>
        <!-- 解析 -->
        <AnalysisCom 
            :analysis="question.analysis" 
            :showAnalysis="showAnswerComputed" 
            :isAIanswer="question.isAIanswer=== 1 ? true:false"/>
    </view>
</template>

<script setup>
import { ref ,computed,onMounted,watch} from 'vue';
import { useSubjectiveAnswerStore } from '@/stores/modules/SubjectiveAnswerStore';
import AnalysisCom from '@/components/modules/exam/Analysiscom.vue';

const subjectiveAnswerStore = useSubjectiveAnswerStore();// 初始化 store
const props = defineProps({
    question: {
        type: Object,
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    },
    currentMode: {
        type: Number,
        default: 0 // 默认值为0，表示答题模式 1为学习模式
    },
    enableWordQuery: {
        type: Boolean,
        default: true // 默认启用单词查询功能
        // 使用说明：
        // 1. 双击题干中的单词（500ms内）可以查看单词信息
        // 2. 显示内容包括：音标、翻译、例句
        // 3. 可以集成真实的词典API（如百度翻译、有道词典等）
        // 4. 设置为false可以禁用单词查询功能，恢复原始显示
    }
});
const userinput = ref('');
const isShowAnswer = ref(false);
const selectedWord = ref('');
const processedStem = ref(null);
const lastTapTime = ref(0);
const lastTapWord = ref('');
const enableWordQuery = ref(true); // 是否启用单词查询功能

const showAnswerComputed = computed(() => {
    if(props.currentMode === 1){
        //学习模式直接显示
        return true;
    }
    // 答题模式，根据用户点击显示答案
    return isShowAnswer.value;
});
// 监听用户输入变化，保存到 store
watch(userinput, (newInput) => {
    subjectiveAnswerStore.saveUserAnswer(props.question._id, newInput);
}, { deep: true });

// 处理用户自评
const handleSelfEvaluation = (isCorrect) => {
    subjectiveAnswerStore.saveUserSelfEvaluation(props.question._id, isCorrect);
};

// 处理长按事件
const handleLongPress = (e) => {
    // 长按可以触发单词选择模式
    console.log('长按触发单词选择模式');
};

// 处理单词点击（模拟双击）
const handleWordClick = (word) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime.value;
    
    // 检测双击（500ms内点击同一个单词）
    if (timeDiff < 500 && lastTapWord.value === word) {
        // 双击事件触发
        selectedWord.value = word;
        // 清理单词，去除标点符号
        const cleanWord = word.replace(/[，。！？；：""（）【】《》〈〉「」『』〔〕［］｛｝\s]/g, '');
        if (!cleanWord) return;
        
        // 显示单词信息弹窗
        showWordInfo(cleanWord);
    }
    
    // 更新最后点击信息
    lastTapTime.value = currentTime;
    lastTapWord.value = word;
};

// 显示单词信息
const showWordInfo = async (word) => {
    try {
        // 这里可以调用词典API，现在先用模拟数据
        const wordInfo = await getWordInfo(word);
        
        uni.showModal({
            title: '单词信息',
            content: `单词: ${word}\n音标: [${wordInfo.phonetic || '暂无'}]\n翻译: ${wordInfo.translation || '暂无'}\n例句: ${wordInfo.example || '暂无'}`,
            showCancel: false,
            confirmText: '确定'
        });
    } catch (error) {
        uni.showModal({
            title: '单词信息',
            content: `单词: ${word}\n\n暂无详细信息`,
            showCancel: false,
            confirmText: '确定'
        });
    }
};

// 获取单词信息（支持真实API调用）
const getWordInfo = async (word) => {
    try {
        // 显示加载中
        uni.showLoading({
            title: '查询中...',
            mask: true
        });
        
        // 这里可以配置真实的词典API
        // 例如：有道词典API、百度翻译API等
        const API_KEY = ''; // 如果需要API密钥
        
        // 模拟API调用，实际使用时替换为真实API
        // const response = await uni.request({
        //     url: `https://api.example.com/dictionary/${word}`,
        //     method: 'GET',
        //     header: {
        //         'Authorization': `Bearer ${API_KEY}`
        //     }
        // });
        
        // 模拟数据 - 实际使用时删除这部分
        await new Promise(resolve => setTimeout(resolve, 500));
        
        uni.hideLoading();
        
        // 返回模拟数据
        return {
            phonetic: getPhonetic(word),
            translation: getTranslation(word),
            example: getExample(word)
        };
        
    } catch (error) {
        uni.hideLoading();
        console.error('获取单词信息失败:', error);
        throw error;
    }
};

// 模拟音标生成
const getPhonetic = (word) => {
    const phonetics = {
        'hello': 'həˈləʊ',
        'world': 'wɜːld',
        'word': 'wɜːd',
        'test': 'test',
        'question': 'ˈkwestʃən'
    };
    return phonetics[word.toLowerCase()] || '暂无音标';
};

// 模拟翻译生成
const getTranslation = (word) => {
    const translations = {
        'hello': '你好',
        'world': '世界',
        'word': '单词；话语',
        'test': '测试；考试',
        'question': '问题；疑问'
    };
    return translations[word.toLowerCase()] || '暂无翻译';
};

// 模拟例句生成
const getExample = (word) => {
    const examples = {
        'hello': 'Hello, how are you?',
        'world': 'The world is beautiful.',
        'word': 'This is a new word for me.',
        'test': 'I have a test tomorrow.',
        'question': 'Can I ask you a question?'
    };
    return examples[word.toLowerCase()] || `This is a sentence with ${word}.`;
};

// 处理题干文本，将其分割成单词数组
const processQuestionStem = () => {
    if (props.question.stem) {
        // 智能分割：保留单词和标点符号，但将空格作为分隔符
        const words = props.question.stem.split(/(\s+)/);
        const result = [];
        
        words.forEach(segment => {
            if (segment.trim() === '') {
                // 如果是纯空格，添加一个空格元素
                if (segment.includes(' ')) {
                    result.push(' ');
                }
            } else {
                // 进一步分割标点符号和单词
                const subSegments = segment.split(/([，。！？；：""（）【】《》〈〉「」『』〔〕［］｛｝])/);
                subSegments.forEach(sub => {
                    if (sub !== '') {
                        result.push(sub);
                    }
                });
            }
        });
        
        processedStem.value = result;
    }
};


onMounted(()=>{
    // 组件挂载时，从 store 获取已保存的答案（如果有）
    const savedAnswer = subjectiveAnswerStore.getUserAnswer(props.question._id);
    if(savedAnswer){
        userinput.value = savedAnswer;
    }

    //挂载时候 保存参考答案到 store
    subjectiveAnswerStore.saveReferenceAnswer(props.question._id,props.question.content);
    
    // 处理题干文本
    processQuestionStem();
    
    // 显示使用提示
    if (props.enableWordQuery) {
        setTimeout(() => {
            uni.showToast({
                title: '双击单词可查看详细信息',
                icon: 'none',
                duration: 3000
            });
        }, 1000);
    }
})
</script>

<style scoped>
.question-container {
    padding: 14rpx 20rpx;
}


.question-index{
   font-size: 28rpx;
    font-weight: bold;
    color: #333;
}
.question-lable{
    margin-left: 12rpx;
    margin-right: 12rpx;
    background-color: #0d82ff;
    color: #fafafa;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
    display: inline-block;
}
.question-top-row{
    float: inline-start;
}
.question-stem{
    font-size: 34rpx;
    color: #000000;
    font-weight: 572;
}
.word-container {
    display: inline;
    line-height: 1.6;
}
.word-item {
    display: inline;
    padding: 2rpx 4rpx;
    margin: 0 2rpx;
    border-radius: 4rpx;
    transition: all 0.2s ease;
}
.word-item:active {
    background-color: #e6f7ff;
}
.word-highlight {
    background-color: #bae7ff;
    color: #0050b3;
}
.input-container {
    margin-top: 30rpx;
    background-color: rgb(248, 248, 248);
    border-radius: 13rpx;
}
.input-label{
    font-size: 28rpx;
    color:#3797ff;
    font-weight: 572;
    margin-left: 13rpx;
    margin-top: 10rpx

}
.input-textarea{
    padding: 15rpx 15rpx 25rpx 15rpx;
}
/* 答案容器样式 */
.question-answer-container {
    margin-top: 50rpx;
    padding: 30rpx 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
}
.answer-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-right: 10rpx;
}
.user-judgment-container{
    margin-top: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8rpx;
    gap: 10rpx;
}
.user-judgment-but{
    flex: 1; /* 让按钮占据相同的宽度 */
    margin: 0 10rpx; /* 调整按钮之间的间距 */
}

.check-container{
    margin-top: 20rpx;
    padding: 0 28rpx;
}
</style>