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
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                        <span>文件列表</span>
                        <!-- <el-tag 
                            v-if="tag" 
                            size="small" 
                            effect="plain" 
                            class="ml-2">{{ tag }}
                        </el-tag> -->
                    </div>
                    <div class="header-actions">
                        <el-input v-model="searchQuery" placeholder="搜索文件名..." :prefix-icon="Search" clearable
                            class="search-input" @input="handleSearch" />
                        <el-button type="primary" :icon="Upload" @click="handleUpload">
                            上传文件
                        </el-button>
                        <el-button :icon="Refresh" circle @click="refreshData" />
                    </div>
                </div>

                <div class="pane-content">
                    <el-table :data="tableData" style="width: 100%; height: 100%" height="100%" highlight-current-row
                        @current-change="handleCurrentChange" v-loading="loading" class="custom-table">
                        <el-table-column prop="name" label="文件名" min-width="180">
                            <template #default="{ row }">
                                <div class="file-name-cell">
                                    <el-icon class="file-icon" :size="20">
                                        <component :is="getFileIcon(row)" />
                                    </el-icon>
                                    <span class="text-truncate">{{ row.name }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="size" label="大小" width="100">
                            <template #default="{ row }">
                                {{ formatSize(row.size) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="mimeType" label="类型" width="120" show-overflow-tooltip />
                        <el-table-column prop="createTime" label="上传时间" width="160">
                            <template #default="{ row }">
                                {{ formatDate(row.createTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="100" fixed="right">
                            <template #default="{ row }">
                                <el-button link type="danger" size="small"
                                    @click.stop="handleDelete(row)">删除</el-button>
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
            <div class="resizer" @mousedown="startResize">
                <div class="resizer-line"></div>
            </div>

            <!-- 右侧面板：预览和详情 -->
            <div class="pane-right" :style="{ width: (100 - leftPaneWidth) + '%' }">
                <div v-if="selectedFile" class="preview-container">
                    <div class="preview-header">
                        <h3>文件详情</h3>
                        <div class="preview-actions">
                            <el-button 
                                type="primary" 
                                link 
                                :icon="CopyDocument"
                                @click="copyLink(selectedFile.url)">复制链接</el-button>
                            <el-button 
                                type="success"       
                                link :icon="Download"
                                @click="downloadFile(selectedFile)">下载</el-button>
                        </div>
                    </div>

                    <!-- 预览区域 -->
                    <div class="preview-stage">
                        <div v-if="isImage(selectedFile)" class="media-wrapper">
                            <el-image :src="selectedFile.url" :preview-src-list="[selectedFile.url]" fit="contain"
                                class="preview-image" />
                        </div>
                        <div v-else-if="isVideo(selectedFile)" class="media-wrapper">
                            <video controls :src="selectedFile.url" class="preview-video"></video>
                        </div>
                        <div v-else-if="isAudio(selectedFile)" class="media-wrapper audio-wrapper">
                            <div class="audio-icon"><el-icon>
                                    <Headset />
                                </el-icon></div>
                            <audio controls :src="selectedFile.url" class="preview-audio"></audio>
                        </div>
                        <div v-else class="media-wrapper file-wrapper">
                            <el-icon size="64" color="#909399">
                                <Document />
                            </el-icon>
                            <p>该文件类型不支持预览</p>
                        </div>
                    </div>

                    <!-- 信息列表 -->
                    <div class="info-list">
                        <div class="info-item">
                            <span class="label">文件名</span>
                            <span class="value">{{ selectedFile.name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">原始名</span>
                            <span class="value">{{ selectedFile.originalName }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">类型</span>
                            <span class="value">{{ selectedFile.mimeType }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">大小</span>
                            <span class="value">{{ formatSize(selectedFile.size) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">分辨率</span>
                            <span class="value" v-if="selectedFile.width">{{ selectedFile.width }} x {{
                                selectedFile.height
                                }}</span>
                            <span class="value" v-else>-</span>
                        </div>
                        <div class="info-item">
                            <span class="label">存储位置</span>
                            <span class="value">
                                <el-tag size="small" type="info">{{ selectedFile.storage }}</el-tag>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="label">业务标签</span>
                            <span class="value">
                                <el-tag v-if="selectedFile.tag" type="success" size="small">{{ selectedFile.tag
                                    }}</el-tag>
                                <span v-else>-</span>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="label">上传者</span>
                            <span class="value">{{ selectedFile.creator || 'Unknown' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">创建时间</span>
                            <span class="value">{{ formatDate(selectedFile.createTime) }}</span>
                        </div>
                        <div class="info-item block">
                            <span class="label">URL</span>
                            <span class="value link" @click="copyLink(selectedFile.url)">{{ selectedFile.url }}</span>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <el-empty description="请选择一个文件查看详情" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    Search, Upload, Refresh, FolderOpened,
    Picture, Document, VideoPlay, Headset,
    CopyDocument, Download
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import Pagination from '@/components/ReuseComponents/Pagination.vue';
import { getFileList } from '@/API/Resource/FileAPI';

// 布局调整逻辑
const leftPaneWidth = ref(65); // 百分比
const isResizing = ref(false);
const splitLayout = ref(null);

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

// 数据逻辑
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const tableData = ref([]); // 模拟数据库
const selectedFile = ref(null);


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
            page: currentPage.value,
            size: pageSize.value
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
    fetchData();
});

const handleSearch = () => {
    currentPage.value = 1;
    fetchData();
};

const handleUpload = () => {
    ElMessage.info('上传功能暂未实现 (Waiting for Backend)');
};

const refreshData = () => {
    fetchData();
    ElMessage.success('刷新成功');
};

const handleCurrentChange = (val) => {
    selectedFile.value = val;
};



const handleDelete = (row) => {
    console.log(row)
};

// 工具函数
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date) => {
    if (!date) return '-';
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const getFileIcon = (file) => {
    if (file.mimeType.startsWith('image/')) return Picture;
    if (file.mimeType.startsWith('video/')) return VideoPlay;
    if (file.mimeType.startsWith('audio/')) return Headset;
    return Document;
};

const isImage = (file) => file.mimeType.startsWith('image/');
const isVideo = (file) => file.mimeType.startsWith('video/');
const isAudio = (file) => file.mimeType.startsWith('audio/');

const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('链接已复制');
    });
};

const downloadFile = (file) => {
    ElMessage.info(`开始下载: ${file.name}`);
};

</script>

<style scoped>
.file-manager-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color);
    overflow: hidden;
}

.split-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    height: 100%;
}

.pane-left {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-right: 1px solid var(--el-border-color-light);
    height: 100%;
}

.pane-header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
}

.header-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    gap: 8px;
}

.header-actions {
    display: flex;
    gap: 8px;
}

.search-input {
    width: 200px;
}

.pane-content {
    flex: 1;
    overflow: hidden;
    padding: 0;
}

.pane-footer {
    padding: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: #fafafa;
    display: flex;
    justify-content: flex-end;
}

.resizer {
    width: 6px;
    cursor: col-resize;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    margin-left: -3px;
    margin-right: -3px;
    position: relative;
}

.resizer:hover .resizer-line,
.resizer:active .resizer-line {
    background-color: var(--el-color-primary);
}

.resizer-line {
    width: 2px;
    height: 32px;
    background-color: var(--el-border-color);
    border-radius: 2px;
    transition: background-color 0.2s;
}

.pane-right {
    background-color: #f9f9fb;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--el-text-color-secondary);
}

.preview-container {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.preview-stage {
    background: #fff;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.media-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.preview-image {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
}

.preview-video {
    max-width: 100%;
    max-height: 400px;
    border-radius: 4px;
}

.audio-wrapper {
    gap: 16px;
}

.audio-icon {
    font-size: 48px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-list {
    background: #fff;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    padding: 20px;
}

.info-item {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item:last-child {
    border-bottom: none;
}

.info-item.block {
    flex-direction: column;
    gap: 6px;
}

.info-item .label {
    width: 100px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
}

.info-item .value {
    flex: 1;
    color: var(--el-text-color-primary);
    font-size: 14px;
    word-break: break-all;
}

.info-item .value.link {
    color: var(--el-color-primary);
    cursor: pointer;
    text-decoration: underline;
}

.file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>    