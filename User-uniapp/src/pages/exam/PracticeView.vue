<template>
    <view>
        PractisePage
    </view>
</template>
<script setup>
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import { onMounted } from 'vue';
const questionStore = useQuestionStore();


onMounted(() => {
   console.log( questionStore.UserChooseQuestion)
})
</script>