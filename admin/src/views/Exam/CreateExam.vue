<template>
    <div class="container">
        <el-page-header @back="handleBack" title="考试列表">
            <template #content>
                <div>
                    <el-icon><Connection /></el-icon>
                    <span >题目面板</span>
                </div>
            </template>
        </el-page-header>
    <el-row :gutter="8">
    <el-col :span="8">
      <el-card shadow="hover" class="info-card">
        <div class="info-container">
          <div class="info-item">
            <div class="info-icon-text">
              <el-icon class="text-success">
                <Collection />
              </el-icon>
              <span class="text-success info-label">科目名称:</span>
            </div>
            <span class="text-primary info-value">{{examData.name}}</span>
          </div>
          <div class="info-item">
            <div class="info-icon-text">
              <el-icon class="text-info">
                <Document />
              </el-icon>
              <span class="text-info info-label">科目代码:</span>
            </div>
            <span class="text-purple-500 info-value">{{ examData.code }}</span>
          </div>
          <div class="info-item">
            <div class="info-icon-text">
              <el-icon class="text-warning">
                <Timer/>
              </el-icon>
              <span class="text-info info-label">最近更新时间:</span>
            </div>
            <span class="text-purple-500 info-value">{{ formatTime.getTime(examData.createdTime) }}</span>
          </div>
          <div class="info-item">
            <div class="info-icon-text">
              <el-icon class="text-warning">
                <View v-if="isPublish === 1" />
                <Hide v-else />
              </el-icon>
              <span class="text-info info-label">发布状态:</span>
            </div>
            <el-switch
              class="info-value"
              :active-value="1"
              :inactive-value="0"
              v-model="isPublish"
              :active-action-icon="View"
              :inactive-action-icon="Hide"/>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" >
        <div>
            
        </div>
      </el-card>
    </el-col>
    <el-col :span="16">
        <el-card shadow="hover">
        </el-card>
    </el-col>
  </el-row>
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter,useRoute } from 'vue-router'
import {Connection,Collection,Document,Timer,View,Hide} from '@element-plus/icons-vue'
import formatTime from '@/util/formatTime'

const router = useRouter()
const route = useRoute()
const examData = ref(JSON.parse(route.query.examData))
const isPublish = ref(examData.value.isPublish)



onMounted(async () => {
   console.log(examData.value)
})

const handleBack = () => {
    router.back()
}

</script>
<style scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
.el-card {
  margin-top: 12px;
  border-radius: 10px;
}
.info-card .info-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card .info-container .info-item {
  padding: 8px;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: background-color 0.3s;
}
.info-card .info-container .info-item:hover {
  background-color: #f3f4f6;
}
.info-card .info-container .info-item .info-icon-text {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.info-card .info-container .info-item .info-icon-text .el-icon {
  margin-right: 8px;
}
.info-card .info-container .info-item .info-icon-text .info-label {
  font-size: 14px;
  font-weight: 500;
}
.info-card .info-container .info-item .info-value {
  display: block;
  padding-left: 32px;
  font-size: 16px;
  font-weight: 600;
}
.info-card .info-container .text-success {
  color: #67C23A;
}
.info-card .info-container .text-info {
  color: #909399;
}
.info-card .info-container .text-warning {
  color: #E6A23C;
}
.info-card .info-container .text-primary {
  color: #409EFF;
}
.info-card .info-container .text-purple-500 {
  color: #8B5CF6;
}
</style>