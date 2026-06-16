<template>
    <ThemeProvider>
    <CustomNavBar title="我的题库" @back="handleNavBack" />
    <view class="container">
        <view>
            <UserQuestionBank />
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import UserQuestionBank from "../../components/modules/index/UserQuestionBank.vue";
import CustomNavBar from "../../components/common/CustomNavBar.vue";

const handleNavBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
    } else {
        uni.switchTab({ url: "/pages/index/index" });
    }
};
</script>

<style scoped></style>
