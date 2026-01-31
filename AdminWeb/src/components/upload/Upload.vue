<template>
  <div class="upload-wrapper">
    <el-upload
      class="avatar-uploader"
      action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
      :show-file-list="false"
      :auto-upload="false"
      :on-change="handleChange"
    >
      <img 
        v-if="props.avatar" 
        :src="uploadAvatar" 
        class="avatar" 
      />
      <el-icon 
        v-else 
        class="avatar-uploader-icon">
        <Plus/>
      </el-icon>
    </el-upload>
    <el-button 
      size="small" 
      type="primary" 
      class="resource-btn" 
      @click="showResourceSelector = true" 
      style="margin-top: 10px;"
      v-if="props.isShowResourceSelector"
      >
      从资源中心库选择
    </el-button>
    <ResourceSelector   
      v-model="showResourceSelector" 
      @select="handleResourceSelect"
    />
  </div>
</template>

<script setup>
import { defineEmits, defineProps, computed, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
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

<style>
.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader .avatar {
  width: v-bind('typeof props.width === "number" ? `${props.width}px` : props.width');
  height: v-bind('typeof props.height === "number" ? `${props.height}px` : props.height');
  display: block;
}

.avatar-uploader .el-upload {
  width: v-bind('typeof props.width === "number" ? `${props.width}px` : props.width');
  height: v-bind('typeof props.height === "number" ? `${props.height}px` : props.height');
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: v-bind('typeof props.width === "number" ? `${props.width}px` : props.width');
  height: v-bind('typeof props.height === "number" ? `${props.height}px` : props.height');
  text-align: center;
}
</style>