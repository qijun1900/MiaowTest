<template>
    <div class="container">
        <van-row gutter="5">
                <van-col span="10">
                    <LoadImage
                    :src="`http://${escconfig.serverHost}:${escconfig.serverPort}${examDtail.cover}`"/>
                </van-col>
                <van-col span="14">
                    <van-cell center>
                        <template #icon>
                            <van-icon name="description" />
                        </template>
                        <div class="info-item">考试名称:<span>{{examDtail.name}}</span></div>
                    </van-cell>
                    <van-cell center>
                        <template #icon>
                            <van-icon name="eye" />
                        </template>
                        <div class="info-item">考试年份:<span>{{examDtail.year}}</span></div>
                    </van-cell>
                    <van-cell center>
                        <template #icon>
                            <van-icon name="clock" />
                        </template>
                        <div class="info-item">更新时间:<span>{{formatTime.getTime(examDtail.createdTime)}}</span></div>
                    </van-cell>
                </van-col> 
        </van-row>
    </div>
</template>
<script setup>
import { ref ,onMounted} from 'vue';
import getOneExamDtail from '@/API/getOneExamDtail';
import LoadImage from '../FuntionComponents/LoadImage.vue';
import escconfig from '@/config/esc.config';
import formatTime from '@/util/formatTime';

const examDtail = ref({});
const props = defineProps({
    ExamID :{
        type: String,
        required: true,
    }
})
const fetchData = async () => {
    try {
        const res = await getOneExamDtail(props.ExamID);
        examDtail.value = res;
        console.log(examDtail.value);
    } catch (error) {
        console.error('获取考试数据失败:', error);
    }
};
onMounted(async () => { 
    await fetchData();  // 改为异步函数, 等待数据加载完成
})

</script>
<style scoped>
.container{
    padding: 10px 15px 10px 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 15px;
    margin-left: 10px;
    margin-right: 10px;
    transition: all 0.3s ease;
}
.container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
.info-item {
    margin-bottom: 8px;
    font-size: 14px;
    display: flex;
    align-items: center;
}
.info-item span {
    margin-left: 8px;
    color: #1989fa;
    font-weight: 500;
}
.van-cell {
    padding: 8px 0;
}
.van-icon {
    margin-right: 8px;
    color: #1886f4;
}
</style>