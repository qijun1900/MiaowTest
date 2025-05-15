<template>
        <div>{{ props.UserExamID }}</div>
</template>
<script setup>
import getUserExaminfo from '@/API/getUserExam';
import { onMounted ,ref} from 'vue';
const UserExaminfo = ref([]);
const props = defineProps({
    UserExamID: {
        type: String,
        required: true,
    }
})
const emit = defineEmits(['updateData']);
const  fetchData = async () => {
   try {
    const res = await getUserExaminfo(props.UserExamID);
    UserExaminfo.value = res[0]
    console.log(UserExaminfo.value)
    if(UserExaminfo.value){
       emit('updateData', UserExaminfo.value._id); // 传递数据
    }
   }catch (error) {
        console.error('获取考试数据失败:', error);
   }
}
onMounted(async () => {
    await fetchData();
    
})

</script>