<template>
  <view class="translate-test">
    <view class="container">
      <h2>翻译测试</h2>
      <view class="input-section">
        <input type="text" v-model="inputText" placeholder="请输入待翻译文本" />
        <button @click="handleTranslate">翻译</button>
      </view>
      <view class="result-section" v-if="translationResult">
        <h3>翻译结果：</h3>
        <view class="result-content">{{ translationResult }}</view>
      </view>
      <view class="loading" v-if="loading">加载中...</view>
      <view class="error" v-if="error">{{ error }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { translateEnToZh } from '@/API/Application/TranslateAPI';

const inputText = ref('Hello world');
const translationResult = ref('');
const loading = ref(false);
const error = ref('');

const handleTranslate = async () => {
  if (!inputText.value) {
    error.value = '请输入待翻译文本';
    return;
  }
  
  loading.value = true;
  error.value = '';
  translationResult.value = '';
  
  try {
    const result = await translateEnToZh(inputText.value);
    translationResult.value = JSON.stringify(result, null, 2);
  } catch (err) {
    error.value = `翻译失败：${err.message}`;
    console.error('翻译错误：', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.translate-test {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.input-section {
  margin: 20px 0;
}

input {
  width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.result-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.result-content {
  white-space: pre-wrap;
  font-family: monospace;
  margin-top: 10px;
}

.loading {
  color: #007aff;
  margin: 20px 0;
}

.error {
  color: #ff3b30;
  margin: 20px 0;
}
</style>