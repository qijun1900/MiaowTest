<template>
<van-config-provider :theme-vars="themeVars">
    <div class="container">
        <van-grid 
            :column-num="2"
            :gutter="10">
            <van-grid-item>
                <van-image
                src="https://ts3.tc.mm.bing.net/th/id/OIP-C.ZXTDEVwZ_P3usots8v0ddAHaKe?cb=iwp1&rs=1&pid=ImgDetMain"
                />
                <span class="van-grid-item__text">测试文字1</span>
            </van-grid-item>
            <van-grid-item>
                <van-image
                src="https://ts3.tc.mm.bing.net/th/id/OIP-C.ZXTDEVwZ_P3usots8v0ddAHaKe?cb=iwp1&rs=1&pid=ImgDetMain"
                />
                <span class="van-grid-item__text">测试文字2</span>
            </van-grid-item>
        </van-grid>
    </div>
</van-config-provider>
</template>
<script setup>
import { ref } from 'vue'

// 定制 Grid 组件主题
const themeVars = ref({
  gridItemTextFontSize: '16px',    // 文字大小
  gridItemTextColor: '#2d2d2d',    // 文字颜色
  gridItemBackground: '#ffffff',   // 背景颜色
  gridItemContentPadding: '16px'   // 内边距
})
</script>
<style scoped>
.van-grid-item__text {
    margin-top: 5px; /* 文字与图片的间距 */
}
</style>