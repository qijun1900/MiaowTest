<template>
    <div>
        <el-page-header 
        @back="handleBack"
            title="选择类题">
            <template #content>
                <div class="flex items-center">
                <el-icon class="mr-2"><DocumentAdd /></el-icon>
                <span class="text-xl font-bold">考试题目编辑</span>
                </div>
            </template>
        </el-page-header>
    </div>
</template>


<script setup>
import { onMounted } from 'vue';   
import { useRoute,useRouter } from 'vue-router';
import axios from 'axios';
import{DocumentAdd} from '@element-plus/icons-vue'



const route = useRoute();
const router = useRouter();
onMounted(() => {
    console.log("@@@ID",route.params.id);
});
// 添加返回方法
const handleBack = () => {
    router.back()
}
</script>
<style lang="css" scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
</style>
