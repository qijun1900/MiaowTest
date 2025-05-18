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
                            <van-icon name="description" size="20" />
                        </template>
                        <div class="info-item">考试名称:<span>{{examDtail.name}}</span></div>
                    </van-cell>
                    <van-cell center>
                        <template #icon>
                            <van-icon name="eye-o"  size="20"/>
                        </template>
                        <div class="info-item">考试年份:<span>{{examDtail.year}}</span></div>
                    </van-cell>
                    <van-cell center>
                        <template #icon>
                            <van-icon name="underway" size="19"/>
                        </template>
                        <div class="info-item">更新时间:<span>{{formatTime.getTime(examDtail.createdTime)}}</span></div>
                    </van-cell>
                        <van-cell center>
                        <template #icon>
                            <codeIcon size="20" color="#1989fa" class="margin"/>
                        </template>
                        <div class="info-item">考试代码:<span>{{examDtail.code}}</span></div>
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
import codeIcon from '@/components/icons/codeIcon.vue';

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
    } catch (error) {
        console.error('获取考试数据失败:', error);
    }
};
onMounted(async () => { 
    await fetchData();  // 改为异步函数, 等待数据加载完成
})

</script>
<style scoped>
.container {
padding: 10px 15px;
background-color: #fff;
/*background-image: linear-gradient(to right, #e192e3, #7dcade);  左右水平渐变 */
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
margin: 10px;
transition: all 0.3s ease;
max-width: 100%;
overflow: hidden;
/*opacity: 0.9; */
/* 或使用颜色自带透明度（示例） */
/*background-image: linear-gradient(to right, rgba(225, 146, 227, 0.9), rgba(125, 202, 222, 0.9))*/;
}

/* 响应式布局调整 */
.van-row {
    flex-wrap: nowrap;
}

.van-col {
    /* 图片列 */
    &:first-child {
        min-width: 120px;
        max-width: 150px;
    }
    /* 信息列 */
    &:last-child {
        flex: 1;
        min-width: 0; /* 防止内容溢出 */
    }
}

/* 触摸优化 */
.van-cell {
    padding: 8px 0;
    min-height: 44px;
    display: flex;
    align-items: center;
}

.info-item {
    margin-bottom: 8px;
    font-size: 16px;
    display: flex;
    align-items: center;
    color: #3d3c3c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info-item span {
    margin-left: 8px;
    color: #1989fa;
    font-weight: 500;
    white-space: normal;
    word-break: break-word;
}

.van-icon {
    margin-right: 8px;
    color: #1886f4;
    /* 图标触摸优化 */
    padding: 4px;
}
.margin{
    margin-right: 10px; /* 间距 */;
    margin-left: 6px;
    margin-bottom: 6px;
}

/* 移动端 hover 效果优化 */
@media (hover: hover) {
    .container:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
}

/* 移动端小屏幕适配 */
@media (max-width: 375px) {
    .info-item {
        font-size: 14px;
    }
    
    .van-icon {
        font-size: 16px;
    }
    
    .container {
        padding: 8px 12px;
        margin: 8px;
    }
}
</style>