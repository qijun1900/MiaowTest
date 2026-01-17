<template>
  <view class="container"> 
    <!-- uView自定义导航栏 -->
    <u-navbar 
        bgColor="#F8F8F8" 
        :autoBack="true">
        <template #center>
            <UviewSubsection 
              :list="list" 
              class="subsection-wrapper" 
              @updateCurrent="handleSendMode"/>
        </template> 
    </u-navbar>
    <!-- 页面内容 -->
    <view    
      class="content" 
      :style="{ paddingTop: navBarHeight + 'px',}">
      <wordRemberView v-if="currentMode===0"/>
      <wordBooksView v-if="currentMode===1"/>
    </view>
  </view>
</template>
<script setup>
import { ref,onMounted } from 'vue';
import navBarHeightUtil from '../../util/navBarHeight';
import UviewSubsection from "../../components/core/uviewSubsection.vue";
import wordBooksView from './WordsToolView_children/wordBooksView.vue';
import wordRemberView from './WordsToolView_children/wordRemberView.vue';

const list = ref(['背单词','单词本']);
const navBarHeight = ref(0); // 导航栏高度
const currentMode = ref(0);

const handleSendMode = (mode) => {
  currentMode.value = mode;
}

onMounted(() => {
  const navInfo = navBarHeightUtil.getNavBarInfo();
  navBarHeight.value = navInfo.totalHeight;
})

</script>

<style scoped>
.subsection-wrapper {
  width: 40%; /* 控制分段控制器的宽度 */
  margin: 0 auto; /* 居中显示 */
}
</style>