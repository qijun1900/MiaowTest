<template>
  <div class="upload-wrapper">
    <div class="upload-container">
      <el-upload
        class="avatar-uploader"
        action="#"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleChange"
      >
        <div v-if="props.avatar" class="avatar-preview-wrapper">
          <img :src="uploadAvatar" class="avatar" />
          <div class="edit-mask">
            <el-icon class="edit-icon"><Edit /></el-icon>
            <span class="edit-text">更换图片</span>
          </div>
        </div>
        <div v-else class="upload-placeholder">
          <el-icon class="upload-icon"><Plus /></el-icon>
          <span class="upload-text">点击上传</span>
        </div>
      </el-upload>
      
      <div 
        v-if="props.isShowResourceSelector"
        class="resource-select-bar"
        @click="showResourceSelector = true"
      >
        <el-icon><Picture /></el-icon>
        <span>从资源库选择</span>
      </div>
    </div>

    <ResourceSelector   
      v-model="showResourceSelector" 
      @select="handleResourceSelect"
    />
  </div>
</template>

<script setup>
import { defineEmits, defineProps, computed, ref } from 'vue';
import { Plus, Edit, Picture } from '@element-plus/icons-vue';
import formatImageUrl from '@/util/formatImageUrl';
import ResourceSelector from './ResourceSelector.vue';
import axios from 'axios';

const props = defineProps({
  avatar: String,
  width: {
    type: [String, Number],
    default: '178px'
  },
  height: {
    type: [String, Number],
    default: '178px'
  },
  isShowResourceSelector: {
    type: Boolean,
    default: true
  } 
});

const showResourceSelector = ref(false);

const emit = defineEmits(['AvatarChange']);

const handleChange = (file) => {
  emit('AvatarChange', file.raw);
};

const handleResourceSelect = async (fileResource) => {
  try {
      const imageUrl = formatImageUrl(fileResource.url);
      
      // 使用一个新的 axios 实例，避免全局拦截器添加 Authorization 头
      // 导致静态资源请求因 CORS 预检失败（通常静态资源不需要 Token）
      const cleanAxios = axios.create();
      
      const response = await cleanAxios.get(imageUrl, { 
          responseType: 'blob',
          // 显式移除 Authorization 头，以防万一
          headers: {
              'Authorization': undefined
          }
      });
      
      const blob = response.data;
      const file = new File([blob], fileResource.name, { type: blob.type });
      
      // 添加 uid 模拟 element-plus upload 组件的行为
      file.uid = Date.now();
      
      emit('AvatarChange', file);
      
  } catch (error) {
      console.error('资源选择处理失败', error);
      // 如果跨域下载失败，尝试提示用户
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.warning('无法加载该资源文件（可能是跨域限制），请尝试本地上传');
      });
  }
};

const uploadAvatar = computed(() =>
  props.avatar.includes('blob')
    ? props.avatar
    : formatImageUrl(props.avatar)
);
</script>

<style scoped>
.upload-wrapper {
  display: inline-block;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  width: v-bind('typeof props.width === "number" ? `${props.width}px` : props.width');
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  background-color: #fafafa;
  width: 100%;
  height: v-bind('typeof props.height === "number" ? `${props.height}px` : props.height');
}

/* 调整底部圆角，因为下面接了按钮 */
.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
  background-color: #ecf5ff;
}

.avatar-preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover; /* 默认 cover，填充 */
}

.edit-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-preview-wrapper:hover .edit-mask {
  opacity: 1;
}

.edit-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.edit-text {
  font-size: 12px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8c939d;
  transition: color 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) .upload-placeholder {
  color: var(--el-color-primary);
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: inherit;
}

.resource-select-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  background-color: #f5f7fa;
  border: 1px dashed var(--el-border-color);
  border-top: none;
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.resource-select-bar:hover {
  background-color: #ecf5ff;
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.resource-select-bar .el-icon {
  font-size: 14px;
}
</style>