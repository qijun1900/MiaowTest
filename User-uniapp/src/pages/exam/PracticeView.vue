<template>
    <view>
        <!-- uView自定义导航栏 -->
        <u-navbar 
            title="" 
            bgColor="#F8F8F8" 
            :autoBack="true">
            
            <template #center>
                <UviewSubsection :list="list"/>
            </template> 

            <template #right>
            <up-icon
                name="star"
                size="20">
            </up-icon>
            </template>
        </u-navbar>
        
        <!-- 页面内容 -->
        <view class="content">
            PractisePage
        </view>
    </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import UviewSubsection from "../../components/core/uviewSubsection.vue";

const questionStore = useQuestionStore();
const list = ref(['答题模式', '学习模式']);// 添加subsection需要的数据


onMounted(() => {
   console.log( questionStore.UserChooseQuestion)
})
</script>
<style scoped>


</style>