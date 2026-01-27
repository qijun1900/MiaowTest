<template>
    <div class="file-manager-container">
        <!-- 分割布局 -->
        <div class="split-layout" ref="splitLayout">
            <!-- 左侧面板：文件列表 -->
            <div 
                class="pane-left" 
                :style="{ width: leftPaneWidth + '%' }">
                <div class="pane-header">
                    <div class="header-title">
                        <el-icon class="folder-icon">
                            <FolderOpened />
                        </el-icon>
                        <span>文件管理</span>
                    </div>
                    <div class="header-actions">
                        <el-input 
                            v-model="searchQuery" 
                            placeholder="搜索文件名..." 
                            :prefix-icon="Search" 
                            clearable
                            class="search-input" 
                            @input="handleSearch"
                            :class="{ 'search-input-focused': isSearchFocused }"
                            @focus="isSearchFocused = true"
                            @blur="isSearchFocused = false" />
                        <el-select
                            v-model="selectedTag"
                            placeholder="按标签筛选"
                            clearable
                            filterable
                            default-first-option
                            class="tag-select"
                            @change="handleTagChange"
                        >
                            <el-option
                                v-for="item in tagOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                        <el-button 
                            type="primary" 
                            :icon="Upload" 
                            @click="handleUpload"
                            class="upload-button"
                            :class="{ 'upload-button-hover': isUploadHover }"
                            @mouseenter="isUploadHover = true"
                            @mouseleave="isUploadHover = false">
                            上传文件
                        </el-button>
                        <el-button 
                            :icon="Refresh" 
                            circle 
                            @click="refreshData"
                            class="refresh-button"
                            :class="{ 'refresh-button-spinning': isRefreshing }" 
                        />
                    </div>
                </div>

                <div class="pane-content">
                    <el-table 
                        :data="tableData" 
                        style="width: 100%; height: 100%" 
                        height="100%" 
                        highlight-current-row
                        @current-change="handleCurrentChange" 
                        v-loading="loading"
                        :row-class-name="tableRowClassName"
                        class="file-table">
                        <el-table-column prop="name" label="文件名" min-width="180">
                            <template #default="{ row }">
                                <div class="file-name-cell">
                                    <el-icon class="file-icon" :size="20" :class="getFileIconClass(row)">
                                        <component :is="getFileIcon(row, { Picture, VideoPlay, Headset, Document })" />
                                    </el-icon>
                                    <span class="text-truncate">{{ row.name }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="size" label="大小" width="100">
                            <template #default="{ row }">
                                <span class="file-size">{{ formatFileSize(row.size) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="mimeType" label="类型" width="120" show-overflow-tooltip>
                            <template #default="{ row }">
                                <el-tag size="small" :type="getFileTypeTagType(row.mimeType)">{{ row.mimeType.split('/')[1] }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" label="上传时间" width="160">
                            <template #default="{ row }">
                                <span class="file-time">{{ formatTime.formatDate(row.createTime) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" fixed="right">
                            <template #default="{ row }">
                                <div class="file-actions">
                                    <el-button 
                                        link 
                                        type="danger" 
                                        size="small"
                                        @click.stop="handleDelete(row)"
                                        class="action-button delete-button"
                                        :class="{ 'action-button-hover': hoveredAction === 'delete-' + row.id }"
                                        @mouseenter="hoveredAction = 'delete-' + row.id"
                                        @mouseleave="hoveredAction = ''">删除
                                    </el-button>
                                    <el-button
                                        link 
                                        type="primary" 
                                        size="small"
                                        @click.stop="HnadleEditFile(row)"
                                        class="action-button edit-button"
                                        :class="{ 'action-button-hover': hoveredAction === 'edit-' + row.id }"
                                        @mouseenter="hoveredAction = 'edit-' + row.id"
                                        @mouseleave="hoveredAction = ''">编辑
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <div class="pane-footer">
                        <Pagination
                            :total="total"
                            v-model:current-page="currentPage"
                            v-model:page-size="pageSize"
                            @page-change="handlePageChange"
                            size="small"
                        />
                </div>
            </div>

            <!-- 调整大小手柄 -->
            <div 
                class="resizer" 
                @mousedown="startResize" 
                :class="{ 'resizer-active': isResizing }">
                <div class="resizer-line"></div>
            </div>

            <!-- 右侧面板：预览和详情 -->
            <div class="pane-right" :style="{ width: (100 - leftPaneWidth) + '%' }">
                <div 
                v-if="selectedFile" 
                class="preview-container" 
                :class="{ 'preview-container-enter': true }">
                    <div class="preview-header">
                        <h3 class="preview-title">
                            <el-icon class="preview-title-icon">
                                <component :is="getFileIcon(selectedFile, { Picture, VideoPlay, Headset, Document })" />
                            </el-icon>
                            {{ selectedFile.name }}
                        </h3>
                        <div class="preview-actions">
                            <el-button 
                                type="primary" 
                                link 
                                :icon="CopyDocument"
                                @click="copyLink(selectedFile.url)"
                                class="preview-action-button"
                                :class="{ 'preview-action-button-hover': hoveredPreviewAction === 'copy' }"
                                @mouseenter="hoveredPreviewAction = 'copy'"
                                @mouseleave="hoveredPreviewAction = ''">复制链接</el-button>
                            <el-button 
                                type="success"       
                                link 
                                :icon="Download"
                                @click="downloadFile(selectedFile)"
                                class="preview-action-button"
                                :class="{ 'preview-action-button-hover': hoveredPreviewAction === 'download' }"
                                @mouseenter="hoveredPreviewAction = 'download'"
                                @mouseleave="hoveredPreviewAction = ''">下载</el-button>
                        </div>
                    </div>

                    <!-- 预览区域 -->
                    <div class="preview-stage">
                        <div v-if="isImage(selectedFile)" class="media-wrapper image-wrapper">
                            <el-image 
                                :src="selectedFile.url" 
                                :preview-src-list="[selectedFile.url]" 
                                fit="contain"
                                class="preview-image"
                                :class="{ 'preview-image-loaded': true }" />
                        </div>
                        <div v-else-if="isVideo(selectedFile)" class="media-wrapper video-wrapper">
                            <video controls :src="selectedFile.url" class="preview-video"></video>
                        </div>
                        <div v-else-if="isAudio(selectedFile)" class="media-wrapper audio-wrapper">
                            <div class="audio-icon-container">
                                <el-icon class="audio-icon">
                                    <Headset />
                                </el-icon>
                            </div>
                            <audio controls :src="selectedFile.url" class="preview-audio"></audio>
                        </div>
                        <div v-else class="media-wrapper file-wrapper">
                            <div class="file-icon-container">
                                <el-icon size="64" color="#909399">
                                    <Document />
                                </el-icon>
                            </div>
                            <p class="file-not-supported">该文件类型不支持预览</p>
                        </div>
                    </div>

                    <!-- 信息列表 -->
                    <div class="info-list">
                        <div class="info-item" v-for="(item, index) in fileInfoList" :key="index">
                            <span class="label">{{ item.label }}</span>
                            <span class="value" v-if="!item.isTag">
                                {{ item.value }}
                            </span>
                            <span class="value" v-else>
                                <el-tag size="small" :type="item.tagType">{{ item.value }}</el-tag>
                            </span>
                        </div>
                        <div class="info-item block">
                            <span class="label">URL</span>
                            <div class="url-container">
                                <span class="value link" @click="copyLink(selectedFile.url)">{{ selectedFile.url }}</span>
                                <el-button 
                                    type="primary" 
                                    size="small"
                                    :icon="CopyDocument"
                                    @click="copyLink(selectedFile.url)"
                                    class="copy-url-button"
                                    :class="{ 'copy-url-button-hover': hoveredPreviewAction === 'copy-url' }"
                                    @mouseenter="hoveredPreviewAction = 'copy-url'"
                                    @mouseleave="hoveredPreviewAction = ''">复制
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <div class="empty-state-content">
                        <el-icon class="empty-icon">
                            <Document />
                        </el-icon>
                        <h4 class="empty-title">未选择文件</h4>
                        <p class="empty-description">请从左侧列表中选择一个文件查看详情</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import {
    Search, Upload, Refresh, FolderOpened,
    Picture, Document, VideoPlay, Headset,
    CopyDocument, Download
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Pagination from '@/components/ReuseComponents/Pagination.vue';
import { getFileList, getTags } from '@/API/Resource/FileAPI';
import RouterPush from '@/util/RouterPush';
import { 
    isImage,
    isVideo, 
    isAudio, 
    getFileIcon } 
from '@/util/resourceUtils';
import { 
    getFileIconClass, 
    getFileTypeTagType, 
    tableRowClassName, 
    generateFileInfoList, 
    formatFileSize } 
from '@/util/fileListUtils';
import formatTime from '@/util/formatTime';

// 布局调整逻辑
const leftPaneWidth = ref(65); // 百分比
const isResizing = ref(false);
const splitLayout = ref(null);

// 数据逻辑
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const tableData = ref([]); // 模拟数据库
const selectedFile = ref(null);

// 标签筛选
const tagOptions = ref([]);
const selectedTag = ref('');

// 交互状态
const isSearchFocused = ref(false);
const isUploadHover = ref(false);
const isRefreshing = ref(false);
const hoveredAction = ref('');
const hoveredPreviewAction = ref('');

// 开始调整大小
const startResize = () => {
    isResizing.value = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
};

const handleResize = (e) => {
    if (!isResizing.value || !splitLayout.value) return;
    const containerRect = splitLayout.value.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // 限制最小和最大宽度
    if (newLeftWidth > 20 && newLeftWidth < 80) {
        leftPaneWidth.value = newLeftWidth;
    }
};
// 停止调整大小
const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
};

// 获取标签列表
const fetchTags = async () => {
    try {
        const response = await getTags();
        if (response.code === 200) {
            tagOptions.value = response.data.map(tag => ({
                label: tag,
                value: tag
            }));
        }
    } catch (error) {
        console.error('获取标签失败', error);
    }
};


const handlePageChange = ({page, size}) => {
    currentPage.value = page
    pageSize.value = size
    fetchData();    
};

const fetchData = async () => {
    loading.value = true;
    try{
        const res = await getFileList({
            search: searchQuery.value,
            tag: selectedTag.value,
            page: currentPage.value,
            size: pageSize.value,
        });
        console.log(res);
        if(res.code === 200){
            tableData.value = res.data.list;
            total.value = res.data.total;
        }
    }catch(err){
        console.error(err);
        ElMessage.error('获取文件列表失败');
    }finally{
        loading.value = false;
    }
};

onMounted(() => {
    fetchTags();
    fetchData();
});

// 处理标签筛选
const handleTagChange = () => {
    currentPage.value = 1;
    fetchData();
};

const handleUpload = () => {
    RouterPush( '/resource/fileupload',);
};

const refreshData = () => {
    isRefreshing.value = true;
    fetchData().finally(() => {
        isRefreshing.value = false;
        ElMessage.success('刷新成功');
    });
};

const handleCurrentChange = (val) => {
    selectedFile.value = val;
};

const handleSearch = () => {
    currentPage.value = 1;
    fetchData();
};

const handleDelete = (row) => {
    console.log(row)
};

const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('链接已复制');
    });
};
const HnadleEditFile = (file) => {
    ElMessage.info(`编辑文件: ${file.name}`);
};

// TODO 下载
const downloadFile = (file) => {
    ElMessage.info(`开始下载: ${file.name}`);
};

// 文件信息列表
const fileInfoList = computed(() => {
    return generateFileInfoList(selectedFile.value);
});

</script>
<style scoped>
/* 主容器样式 */
.file-manager-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color);
    overflow: hidden;
}

/* 分割布局 */
.split-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    height: 100%;
}

/* 左侧面板 */
.pane-left {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-right: 1px solid var(--el-border-color-light);
    height: 100%;
    transition: all 0.3s ease;
}

/* 面板头部 */
.pane-header {
    padding: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    gap: 10px;
}

.folder-icon {
    font-size: 20px;
    color: var(--el-color-primary);
    animation: folderPulse 2s infinite;
}

@keyframes folderPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* 搜索输入框 */
.search-input {
    width: 220px;
    border-radius: 20px;
    transition: all 0.3s ease;
}

.search-input-focused {
    box-shadow: 0 0 0 2px var(--el-color-primary-light-3);
    transform: translateY(-1px);
}

/* 标签选择器 */
.tag-select {
    width: 180px;
    border-radius: 20px;
}

/* 上传按钮 */
.upload-button {
    border-radius: 20px;
    transition: all 0.3s ease;
}

.upload-button-hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

/* 刷新按钮 */
.refresh-button {
    border-radius: 50%;
    transition: all 0.3s ease;
}

.refresh-button-spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 面板内容 */
.pane-content {
    flex: 1;
    overflow: hidden;
    padding: 0;
}

/* 文件表格 */
.file-table {
    width: 100%;
    height: 100%;
}

.file-table ::v-deep .el-table__row {
    transition: all 0.3s ease;
}

.file-table ::v-deep .el-table__row:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateX(5px);
}

.file-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.file-icon {
    transition: all 0.3s ease;
}

.file-icon:hover {
    transform: scale(1.1);
}

.file-icon-image {
    color: var(--el-color-primary);
}

.file-icon-video {
    color: var(--el-color-warning);
}

.file-icon-audio {
    color: var(--el-color-success);
}

.file-icon-document {
    color: var(--el-color-info);
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;
}

.file-size {
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

.file-time {
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

/* 文件操作按钮 */
.file-actions {
    display: flex;
    gap: 8px;
}

.action-button {
    transition: all 0.3s ease;
    border-radius: 4px;
}

.action-button-hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.delete-button:hover {
    color: var(--el-color-danger);
}

.edit-button:hover {
    color: var(--el-color-primary);
}

/* 面板底部 */
.pane-footer {
    padding: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    justify-content: flex-end;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

/* 调整大小手柄 */
.resizer {
    width: 8px;
    cursor: col-resize;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    margin-left: -4px;
    margin-right: -4px;
    position: relative;
    transition: all 0.3s ease;
}

.resizer:hover {
    background-color: rgba(103, 194, 58, 0.1);
}

.resizer-active {
    background-color: rgba(103, 194, 58, 0.2);
}

.resizer:hover .resizer-line,
.resizer-active .resizer-line {
    background-color: var(--el-color-primary);
    height: 60px;
}

.resizer-line {
    width: 2px;
    height: 40px;
    background-color: var(--el-border-color);
    border-radius: 2px;
    transition: all 0.3s ease;
}

/* 右侧面板 */
.pane-right {
    background-color: #f9f9fb;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    transition: all 0.3s ease;
}

/* 空状态 */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--el-text-color-secondary);
}

.empty-state-content {
    text-align: center;
    padding: 40px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.empty-state-content:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.empty-icon {
    font-size: 64px;
    color: var(--el-color-info-light-3);
    margin-bottom: 20px;
}

.empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
}

.empty-description {
    font-size: 14px;
    color: var(--el-text-color-secondary);
}

/* 预览容器 */
.preview-container {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: previewSlideIn 0.5s ease;
}

@keyframes previewSlideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.preview-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.preview-title-icon {
    font-size: 20px;
    color: var(--el-color-primary);
}

.preview-actions {
    display: flex;
    gap: 10px;
}

.preview-action-button {
    transition: all 0.3s ease;
    border-radius: 4px;
}

.preview-action-button-hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 预览区域 */
.preview-stage {
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--el-border-color-lighter);
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.preview-stage:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.media-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.image-wrapper {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.video-wrapper {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.audio-wrapper {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    gap: 20px;
}

.file-wrapper {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    gap: 20px;
}

.preview-image {
    max-width: 100%;
    max-height: 240px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.preview-image-loaded {
    animation: imageFadeIn 0.5s ease;
}

@keyframes imageFadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.preview-video {
    max-width: 100%;
    max-height: 450px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.audio-icon-container {
    font-size: 56px;
    color: var(--el-color-primary);
    background: rgba(255, 255, 255, 0.8);
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    animation: audioPulse 2s infinite;
}

@keyframes audioPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.preview-audio {
    width: 100%;
    max-width: 400px;
    border-radius: 4px;
}

.file-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.file-not-supported {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    text-align: center;
}

/* 信息列表 */
.info-list {
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--el-border-color-lighter);
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.info-list:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.info-item {
    display: flex;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    transition: all 0.3s ease;
}

.info-item:hover {
    background-color: var(--el-color-primary-light-9);
    padding-left: 10px;
    border-radius: 4px;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item.block {
    flex-direction: column;
    gap: 10px;
    padding: 16px 0;
}

.info-item .label {
    width: 120px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    font-weight: 500;
}

.info-item .value {
    flex: 1;
    color: var(--el-text-color-primary);
    font-size: 14px;
    word-break: break-all;
}

/* URL容器 */
.url-container {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.url-container .value {
    flex: 1;
    min-width: 200px;
}

.copy-url-button {
    border-radius: 4px;
    transition: all 0.3s ease;
}

.copy-url-button-hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .pane-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .header-actions {
        justify-content: center;
    }
    
    .search-input {
        width: 200px;
    }
}

@media (max-width: 768px) {
    .leftPaneWidth {
        width: 100% !important;
    }
    
    .pane-right {
        display: none;
    }
    
    .resizer {
        display: none;
    }
    
    .header-actions {
        flex-wrap: wrap;
    }
    
    .search-input {
        width: 100%;
    }
    
    .tag-select {
        width: 100%;
    }
}
</style>    