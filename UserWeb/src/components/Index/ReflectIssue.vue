<template>
<van-action-sheet v-model:show="localShow" :title="props.issuetitle">
  <div class="content">内容</div>
</van-action-sheet>
</template>
<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    Isshow:{
        type:Boolean,
        default:false 
    },
    issuetitle:{
        type:String,
        default:"标题"
    },
})

const emit = defineEmits(['update:Isshow']);

const localShow = ref(props.Isshow);
watch(localShow, (newVal) => {
    emit('update:Isshow', newVal);
});
watch(() => props.Isshow, (newVal) => {
    localShow.value = newVal;
});
</script>