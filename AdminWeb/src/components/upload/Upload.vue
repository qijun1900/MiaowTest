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
import escconfig from '@/config/esc.config';

const props = defineProps({
  avatar: String,
  width: {
    type: [String, Number],
    default: '178px'
  },
  height: {
    type: [String, Number],
    default: '178px'
  }
});

const emit = defineEmits(['AvatarChange']);

const handleChange = (file) => {
  emit('AvatarChange', file.raw);
};

const uploadAvatar = computed(() =>
  props.avatar.includes('blob')
    ? props.avatar
    : `http://${escconfig.serverHost}:${escconfig.serverPort}` + props.avatar
);
</script>

<style>
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