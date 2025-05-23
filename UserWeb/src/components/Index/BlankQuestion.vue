<template>
    <div>
      {{ props.index }}  //balank//{{ question._id }}
    </div>

</template>
<script setup>
import {computed} from 'vue';
const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    questionData: { 
        required: true,
    }
})
const question = computed(() => props.questionData)

</script>