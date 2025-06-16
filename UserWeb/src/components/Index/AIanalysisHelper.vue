<template>
    <van-popup v-model:show="show" closeable position="bottom" :round="true" :style="{ height: '85%' }">
        <div>
            <Divider title="AI题目解析" position="center" dividerFontSize="20px" padding="0 80px" borderColor="#00ddff" />
            <div class="welcome-container">
                <AntWelcome
                :title="selectedValues[0]" 
                description="基于Ant Design X Vue，我可以为您提供问题的详细解释,点击我可前往AI问答界面！🐱"
                @click="handlePush"/>
            </div>
            <div v-for="item in questionData" :key="item._id" class="question-item">

                <div class="question-stem">
                    <span class="stem">{{ item.stem }}</span>
                </div>

                <!-- 选择题(Type 1) -->
                <div v-if="item.Type === 1" class="question-options">
                    <div v-for="(option, index) in item.options" :key="index" class="option-item">
                        <span class="option-content">
                            {{ String.fromCharCode(65 + index) }}. {{ option.content }}
                            <span v-if="option.isCorrect" class="correct-answer">✓</span>
                        </span>
                    </div>
                </div>

                <!-- 填空题(Type 2) -->
                <div v-if="item.Type === 2" class="blank-answers">
                    <div v-for="(answer, index) in item.options" :key="index" class="blank-item">
                        <span class="blank-label">空{{ index + 1 }}:</span>
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
            <div class="talk-container">
                <Flex gap="middle" vertical>
                    <AntBubble
                        placement="end"
                        :content="request"
                        :typingstep="1"
                        :typinginterval="50"
                        typingsuffix="🐱"
                        variant="shadow"
                        :isShowButton="false">
                        <template #bubbleAvatar>
                            <TalkUserIcon />
                        </template>
                     </AntBubble>   
                    <AntBubble
                        :header="modelName"
                        placement="start"
                        :content="LlaRes"
                        :typingstep="4"
                        :typinginterval="30"
                        typingsuffix="😺"
                        variant="shadow"
                        :loading="loading">
                        <template #bubbleAvatar>
                            <TalkAIIcon />
                        </template>
                    </AntBubble>
                </Flex>
                <div v-show="!loading">
                    <AiWarn />
                </div>
            </div>
        </div>
        <div>
            <TDFab @handleClick="HandleClick" text="切换解析模型"/>
        </div>
        <div>
            <VanPicker  
                v-model:show="showPicker" 
                :options="modelOtions"
                @confirm="handelConfirm"
                PickTitle="选择解析模型"
                />
        </div>
        <van-back-top :offset="200" />
    </van-popup>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import Divider from '../FuntionComponents/Divider.vue';
import { Flex} from 'ant-design-vue';
import TalkAIIcon from '../icons/TalkAIIcon.vue';
import TalkUserIcon from '../icons/TalkUserIcon.vue';
import postExamAIanalyse from '@/API/postExamAIanalyse';
import AiWarn from '../FuntionComponents/AiWarn.vue';
import AntWelcome from '../FuntionComponents/AntWelcome.vue';
import RouterPush from '@/util/RouterPush';
import AntBubble from '../FuntionComponents/AntBubble.vue';
import QuestionMap from '@/util/QuestionMap';
import TDFab from '../FuntionComponents/TDFab.vue';
import VanPicker from '../FuntionComponents/VanPicker.vue';
import getLLMList from '@/API/getLLMList'; 


const request = ref("请你给我此题目详细解析");
const LlaRes  =  ref("");
const loading = ref(true);
const modelName = ref("");
const showPicker = ref(false);
const modelOtions = ref([]) 
const selectedValues = ref(['DeepSeek-R1-Distill-Qwen-1.5B']);// 初始值为 'DeepSeek-R1-Distill-Qwen-1.5B'
const selectedmodelvalue = ref('deepseek-r1-distill-qwen-1.5b'); // 初始值为 'deepseek-r1-distill-qwen-1.5b'

const props = defineProps({
    modelValue: Boolean,
    questionData: [Object, Function],  // 修改为接受对象或函数
});

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
//接受数据
const questionData = computed(() => {
    return typeof props.questionData === 'function'
        ? props.questionData()
        : props.questionData;
});
// 定义事件
const emit = defineEmits(['update:modelValue']);


const sendRequest = async () => {
    try {
        const QuestionMapData = QuestionMap(questionData.value[0]);
        const response = await postExamAIanalyse(
            QuestionMapData, 
            questionData.value[0]._id, 
            questionData.value[0].Type,
            request.value,
            selectedmodelvalue.value
        );
        // console.log("modelValue",selectedmodelvalue.value)
        if (response.code === 200) {
            loading.value = false;
            LlaRes.value = response.data.Aidata;
            modelName.value = response.data.modelName
            // console.log("解析结果", response);
        } else {
            LlaRes.value = "服务器繁忙，请稍后再试！";
        }
    } catch (error) {
        console.error("请求失败:", error);
        loading.value = false;
        LlaRes.value = "服务器繁忙，请稍后再试";
    }
};

//页面跳转
const handlePush = () => {
    show.value = false;// 关闭弹窗
    emit('update:modelValue', false);// 关闭弹窗，触发父组件的更新
    RouterPush("/homechat");
};

//点击按钮
const HandleClick = (data) => {
    showPicker.value  = data; 
}
// 处理确认选择事件,选择模型后，关闭弹出框
const handelConfirm = (data) => {
    // console.log('选择的模型:', data.selectedOptions[0]);
    showPicker.value = false;
    selectedValues.value = [data.selectedOptions[0].text]; 
    selectedmodelvalue.value = data.selectedOptions[0].value; 
    
    // 重置加载状态和内容
    loading.value = true;
    LlaRes.value = "";
    modelName.value = "";
    
    sendRequest();
}
// 发送请求到服务器,获取模型列表,提供给用户选择
const getModelList = async () => {
    try {
        const response = await getLLMList();
        if (response.code === 200) {
            modelOtions.value = response.data.map(item => ({
                text: item.modelName,
                value: item.modelValue
            }));
        }
    } catch (error) {
        console.error('API请求错误:', error); 
    }
}

onMounted(() => {
    sendRequest();
    getModelList();
});

</script>

<style scoped>
.welcome-container {
    margin-top: 10px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 10px;
}

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

.talk-container {
    margin-left: 12px;
    margin-right: 12px;
}
</style>