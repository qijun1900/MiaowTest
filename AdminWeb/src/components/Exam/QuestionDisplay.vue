<template>
  <div class="question-display">
    <el-dialog 
        v-model="dialogVisible" 
        title="题目格式示例" 
        width="70%">
      <div class="format-examples">
        <!-- 选择题 -->
        <div class="format-example">
          <h4>选择题格式：</h4>
          <pre>
The department secretary was ______ the guest speaker at the station at 10 this morning, but the speaker’s journey was canceled on a short notice.
   A. about to meet
   B. meeting
   C. to be meeting
   D. to have met
正确答案：D</pre>
        </div>
        
        <!-- 填空题 -->
        <div class="format-example">
          <h4>填空题格式：</h4>
          <pre>
中国历史上第一个封建王朝是________。
正确答案：夏朝</pre>
        </div>
        
        <!-- 判断题 -->
        <div class="format-example">
          <h4>判断题格式：</h4>
          <pre>
Python是一种编译型语言。
正确答案：错误</pre>
        </div>
        
        <!-- 简答题 -->
        <div class="format-example">
          <h4>简答题格式：</h4>
          <pre>
简述抗日战争胜利的历史意义。
正确答案：抗日战争不仅捍卫了国家主权，也重塑了世界格局，对中国现代化进程和民族复兴具有深远影响。</pre>
        </div>
      </div>
    </el-dialog>
    
    <el-button color="#a591db" @click="showFormat">
      查看题目格式
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const dialogVisible = ref(false);

const showFormat = () => {
  dialogVisible.value = true;
};
</script>

<style scoped>
.format-examples {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.format-example {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}

.format-example h4 {
  margin-bottom: 10px;
  color: #626aef;
}

.format-example pre {
  white-space: pre-wrap;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin: 0;
}
</style>