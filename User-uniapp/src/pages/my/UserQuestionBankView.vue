<template>
    <ThemeProvider>
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
</script>

<style scoped></style>
