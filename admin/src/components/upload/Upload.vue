<template>
  <el-upload
    class="avatar-uploader"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    :show-file-list="false"
    :auto-upload="false"
    :on-change="handleChange"
  >
    <img v-if="props.avatar" :src="uploadAvatar" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon">
      <Plus/>
    </el-icon>
  </el-upload>
</template>

<script setup>
import { defineEmits, defineProps, computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import escconfig  from '@/config/esc.config';

// 接收父组件传递的avatar属性(图片URL)
const props = defineProps({
  avatar: String,
});

// 定义事件发射器
const emit = defineEmits(['AvatarChange']);

// 处理文件变化事件
const handleChange = (file) => {
  emit('AvatarChange', file.raw); // 将原始文件对象发送给父组件
};

// 计算属性处理图片URL
const uploadAvatar = computed(() =>
  props.avatar.includes('blob')
    ? props.avatar
    : `http://${escconfig.serverHost}:${escconfig.serverPort}` + props.avatar
);
</script>

<style>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>