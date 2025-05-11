<template>
<van-config-provider :theme-vars="themeVars">
    <div class="container">
        <van-grid 
            :column-num="2"
            :gutter="gutter"
            :border="border">
            <van-grid-item v-for="item in gridItems" :key="item._id">
                <van-image 
                :src="`http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover}`" 
                lazy-load>
                <template v-slot:loading>
                    <van-loading type="spinner" size="20" />
                </template>
                <template v-slot:error>
                    <div class="image-error">
                        <van-icon name="photo-fail" size="40" />
                        <p>图片加载失败</p>
                    </div>
                </template>
                </van-image>
                <span class="van-grid-item__text"><van-icon name="good-job-o"/>{{ item.name }}</span>
            </van-grid-item>
        </van-grid>
        <van-back-top :offset="200" />
    </div>
</van-config-provider>
</template>

<script setup>
import {  ref } from 'vue'
import getExamDetails from '@/API/Index/getExamDetails'
import escconfig from '@/config/esc.config'

const border  = ref(false)
const gutter = ref(10)
const gridItems = ref([])

// 定义 props, 接受不同属性
const props = defineProps({
    IsHotExamContainer: {// 是否是热门考试容器
        type: Boolean,
        required: true
    },
    Ishasborder:{// 是否有边框
        type:Boolean,
        required:true
    },
    GutterNumber:{//间距
        type:Number,
        required:true 
    }

})
border.value = props.Ishasborder
gutter.value = props.GutterNumber
// 获取考试数据
const fetchData = async () => {
    try {
        const res = await getExamDetails()
        if (props.IsHotExamContainer) {
            gridItems.value = res.slice(0, 4) 
        }else{
          gridItems.value = res
        }
        console.log('获取的考试数据:', gridItems.value)
    } catch (error) {
        console.error('获取考试数据失败:', error)
    }
}

// 定制 Grid 组件主题
const themeVars = ref({
  gridItemTextFontSize: '16px',    // 文字大小
  gridItemTextColor: '#2d2d2d',    // 文字颜色
  gridItemBackground: '#ffffff',   // 背景颜色
  gridItemContentPadding: '16px'   // 内边距
})
// 初始化时获取数据
fetchData()
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