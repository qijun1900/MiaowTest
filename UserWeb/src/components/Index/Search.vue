<template>
    <div class="search-container">
        <van-search 
            v-model="SearchText"
            placeholder="请输入搜索关键词"
            shape="round"
            clearable
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'

const SearchText = ref('')

</script>

<style scoped>
.search-container {
    padding: 4px  6px 6px 6px;/* 上右下左内边距 */
    background: #ffffff;
}

:deep(.van-search) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 15px;
}

:deep(.van-field__control) {
    color: #333;
    font-size: 14px;
}

:deep(.van-icon-search) {
    color: #13c4e7;
}

:deep(.van-field__left-icon) {
    margin-right: 8px;
}
</style>