<template>
    <view class="container">
        <!-- TDesign自定义导航栏 -->
        <t-navbar left-arrow :fixed="false" custom-style="background: #F8F8F8">
            <template #title>
                <Subsection
                    :list="list"
                    class="subsection-wrapper"
                    @updateCurrent="handleSendMode"
                />
            </template>
        </t-navbar>
        <!-- 页面内容 -->
        <view class="content">
            <wordRemberView v-if="currentMode === 0" />
            <wordBooksView v-if="currentMode === 1" />
        </view>
    </view>
</template>
<script setup>
import { ref, onMounted } from "vue";
import navBarHeightUtil from "../../util/navBarHeight";
import Subsection from "../../components/core/Subsection.vue";
import wordBooksView from "./WordsToolView_children/wordBooksView.vue";
import wordRemberView from "./WordsToolView_children/wordRemberView.vue";

const list = ref(["背单词", "单词本"]);
const navBarHeight = ref(0); // 导航栏高度
const currentMode = ref(0);

const handleSendMode = (mode) => {
    currentMode.value = mode;
};

onMounted(() => {
    const navInfo = navBarHeightUtil.getNavBarInfo();
    navBarHeight.value = navInfo.totalHeight;
});
</script>

<style scoped>
.subsection-wrapper {
    width: 75%;
    margin: 0 auto;
}
</style>
