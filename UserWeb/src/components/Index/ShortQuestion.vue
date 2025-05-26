<template>
    <div>
      {{ props.index }}//short//{{ question._id }}
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
    },
    isShowAnswer: {
        type: Boolean, 
    },
    isRandom: {
        type: Boolean, 
    }
})
const question = computed(() => props.questionData)
const index = computed(() => props.index)
const isShowAnswer = computed(() => props.isShowAnswer)
const isRandom = computed(() => props.isRandom)

</script>