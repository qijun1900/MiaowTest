<template>
<van-config-provider :theme-vars="themeVars">
    <div class="container">
        <van-grid 
            :column-num="2"
            :gutter="props.GutterNumber"
            :border="props.Ishasborder">
            <van-grid-item 
                v-for="item in gridItems" 
                :key="item._id"
                @click="handlClick(item._id)">
                    <LoadImage :src="`http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover}`" />
                <span class="van-grid-item__text"><van-icon name="good-job-o"/>{{ item.name }}</span>
            </van-grid-item>
        </van-grid>
        <van-back-top :offset="200" />
    </div>
</van-config-provider>
</template>

<script setup>
import {  ref,onMounted,watch } from 'vue'
import getExamDetails from '@/API/getExamDetails'
import escconfig from '@/config/esc.config'
import LoadImage from '../FuntionComponents/LoadImage.vue'
import RouterPush from '@/util/RouterPush'

const gridItems = ref([])

// 定义 props, 接受不同属性
const props = defineProps({
    IsHotExamContainer: {
        type: Boolean,
        required: true
    },
    Ishasborder: {
        type: Boolean,
        default: true,
        required: true
    },
    GutterNumber: {
        type: Number,
        default: 10,
        required: true 
    },
    // 新增接收数据的prop
    UseData: {
        type: Array,
        default: null
    }
})


// 修改获取数据的逻辑
const fetchData = async () => {
    try {
        if (props.UseData) {  // 优先使用传入的数据
            gridItems.value = props.UseData
            return
        }
        const res = await getExamDetails()
        if (props.IsHotExamContainer) {
            gridItems.value = res.slice(0, 4)
        } else {
            gridItems.value = res
        }
    } catch (error) {
        console.error('获取考试数据失败:', error)
    }
}
 //点击跳转
 const handlClick = (itme) => {
    RouterPush(`/ExamReady/${itme}`)
}



// 定制 Grid 组件主题
const themeVars = ref({
  gridItemTextFontSize: '16px',    // 文字大小
  gridItemTextColor: '#2d2d2d',    // 文字颜色
  gridItemBackground: '#ffffff',   // 背景颜色
  gridItemContentPadding: '16px'   // 内边距
})

onMounted(() => {
    fetchData()
})

watch(() => props.UseData, (newVal) => {
    if(newVal && newVal.length > 0) {
        gridItems.value = newVal
    }
})
</script>
<style scoped>
.van-grid-item__text {
    margin-top: 5px;
    font-size: 15px;
    color: #0b0b0b;
    font-weight: 520;
}
.van-image{
    height: 185px;
    border-radius: 6px;
    overflow: hidden;
}
/* 新增图片加载失败样式 */
.image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #969799;
    font-size: 14px;
}
</style>