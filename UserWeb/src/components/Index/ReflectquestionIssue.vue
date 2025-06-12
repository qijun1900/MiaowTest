<template>
    <div>
        <van-popup
        v-model:show="showValue"
        closeable
        close-icon="close" 
        position="bottom"
        round
        :style="{ height: '60%' }"
        @closed="handelClosed">
            <template v-if="!isSubmitted">
                <div class="header">
                    <span class="title">题目问题反馈</span>
                    <simleIcon size="80"/>
                </div>
                <div class="lable">
                    <el-check-tag 
                        :checked="checked === item.value"
                        type="success" 
                        v-for="item in TagInfo2" 
                        :key="item.value"
                        @change="onChange(item.value)">
                        {{ item.label }}
                    </el-check-tag>
                </div>
                <div class="input">
                    <van-cell-group inset>
                        <van-field 
                            autosize
                            size="large"
                            v-model="userinfo"  
                            placeholder="请在此处输入具体问题" />
                    </van-cell-group>
                </div>
                <div class="but">
                    <van-button 
                        type="primary" 
                        size="large" 
                        icon="success" 
                        round
                        @click="handleSubmit">
                        提交问题
                    </van-button>
                </div>
            </template>
            <template v-else>
                <div class="success-content">
                    <div class="success-icon">
                        <SuccessSimleIcon size="100"/>
                    </div>
                    <br>
                    <div>
                        <span class="success-text">
                            谢谢，您对的问题已经提交成功!
                        </span>
                    </div>
                </div>
            </template>
        </van-popup>
    </div>
</template>
<script setup>
import { computed ,ref} from 'vue';
import {TagInfo2} from '@/util/TagInfo';
import simleIcon from '../icons/simleIcon.vue';
import { showToast } from 'vant';
import postUserQuestionIssuse from '@/API/postUserQuestionIssuse';

const props = defineProps({
    show: Boolean, // 改为show以匹配v-model:show
     questionData: [Object, Function],  // 修改为接受对象或函数
})
const checked = ref(null);
const userinfo = ref(''); // 新增用户信息
const isSubmitted = ref(false); // 新增提交状态
//接受数据
const questionData = computed(() => {
    return typeof props.questionData === 'function'
        ? props.questionData()
        : props.questionData;
});

const emit = defineEmits(['update:show']);

const showValue = computed({
    get: () => props.show,
    set: (val) => emit('update:show', val)
});

// 处理选择
const onChange = (value) => {
    checked.value = value
}
// 处理提交问题
const handleSubmit = async () => {
    try {
        if (checked.value === null) {
        showToast({ 
            message: '请选择问题类型', 
            icon: 'warning-o' 
        });
        return;
    }
    const data = {
        ExamtagId: checked.value, // 问题类型
        Type:2, // 问题类型 1:考试 2:题目
        userQuestion: userinfo.value, // 用户描述问题
        stem: questionData.value[0].stem, // 题干
        questionId: questionData.value[0]._id, // 问题ID
        ExamId: questionData.value[0].examId, // 考试ID
    }
    console.log(data);
        const response = await postUserQuestionIssuse(data); // 提交问题
        if (response.code === 200) {
            isSubmitted.value = true;
            showToast({ message: '问题提交成功', icon: 'success' });
        }
    }catch (error) {
        console.error('提交问题失败:', error);
    }
    

}
// 处理关闭弹窗
const handelClosed = () => {
    checked.value = null;
    userinfo.value = ''; // 重置用户信息
}

</script>
<style scoped>
.header {
    display: flex;
    flex-direction: column;
    align-items: center; 
}
.title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
    margin-top: 6px;
}

.lable {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    /* 修改为150px最小宽度 */
    gap: 10px;
    padding: 10px;
}
.el-check-tag {
    font-size: 15px;
    text-align: center;
    transition: all 0.3s;
    margin: 2px;
    padding: 12px 10px;
    /* 调整内边距 */
    border-radius: 20px;
    transition: transform 0.2s;
    white-space: nowrap;
    overflow: hidden;
    /* 新增防止溢出 */
    text-overflow: ellipsis;
    /* 文字过长显示省略号 */
    max-width: 100%;
    /* 确保不超过容器宽度 */
}
.el-check-tag:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.input {
    background-color: #f1f1f1;
    padding: 10px 2px 10px 2px;
    border-radius: 10px;
    margin: 0px 10px 0px 10px;

}
.but {
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 10px;
    margin-top: 10px; 
}
.success-content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.success-icon{
    margin-top: 25px;
    margin-bottom: 20px;
}
.success-text{
    font-size: 22px;
    color: #181c1e;
    font-weight: bold;
}
</style>