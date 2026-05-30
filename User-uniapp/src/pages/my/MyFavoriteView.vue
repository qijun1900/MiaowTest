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
        <view
            class="content"
        >
            <UserQuestionFavorite v-if="currentMode === 0" />
            <UserExamFavorite v-if="currentMode === 1" />
        </view>

        <BackToTop ref="backToTopRef" position="bottom-right" />
    </view>
</template>
<script setup>
import { ref, onMounted } from "vue";
import navBarHeightUtil from "../../util/navBarHeight";
import Subsection from "../../components/core/Subsection.vue";
import UserQuestionFavorite from "../../components/modules/my/UserQuestionFavorite.vue";
import UserExamFavorite from "../../components/modules/index/UserExamFavorite.vue";
import BackToTop from "../../components/core/BackToTop.vue";
import { onPageScroll } from "@dcloudio/uni-app";

const list = ref(["题目收藏", "考试收藏"]);
const navBarHeight = ref(0); // 导航栏高度
const currentMode = ref(0); // 当前选中的模式，0表示题目收藏，1表示考试收藏
const backToTopRef = ref(); // 回到顶部组件引用

//选择模式
const handleSendMode = (value) => {
    currentMode.value = value; // 更新当前选中的模式
};

onMounted(() => {
    const navInfo = navBarHeightUtil.getNavBarInfo();
    navBarHeight.value = navInfo.totalHeight;
});

// 页面滚动事件
onPageScroll((e) => {
    // 调用BackToTop组件的滚动处理方法
    if (backToTopRef.value) {
        backToTopRef.value.handlePageScroll(e);
    }
});
</script>
<style scoped>
.subsection-wrapper {
    width: 75%;
    margin: 0 auto;
}
</style>
