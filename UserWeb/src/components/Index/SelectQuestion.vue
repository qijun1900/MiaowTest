<template>
    <div>
        第{{ props.index }}题 (选择题) ID:{{ props.questionID }}
    </div>
</template>
<script setup>
const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    questionID: {
        type: String,
        required: true,
    }
})
</script>