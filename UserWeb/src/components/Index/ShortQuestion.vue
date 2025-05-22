<template>
    <div>
      {{ props.index }}  //short//{{ props.questionID }}
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