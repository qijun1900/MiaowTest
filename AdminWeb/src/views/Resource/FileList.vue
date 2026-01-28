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

    <!-- 编辑对话框 -->
    <Dialog
        :DilogTitle="'编辑文件资源'"
        :DilogButContent="isUpdating ? '更新中...' : '确认更新'"
        DilogWidth="800px"
        :draggable="true"
        top="5vh"
        v-model="dialogVisible"
        @dialog-confirm="handleConfirmEdit">
        <template #dialogcontent>
            <el-form
                ref="editFormRef"
                :model="editForm"
                label-position="top"
                class="edit-form">
                
                <!-- 文件上传区域 -->
                <el-form-item label="替换文件（可选）">
                    <el-alert
                        v-if="!editForm.file"
                        title="当前保持原文件不变"
                        type="info"
                        :closable="false"
                        show-icon
                        style="margin-bottom: 12px;">
                        <template #default>
                            <span style="font-size: 13px;">如需替换文件，请上传新文件；否则仅更新文件信息</span>
                        </template>
                    </el-alert>
                    <el-alert
                        v-else
                        title="将替换为新文件"
                        type="warning"
                        :closable="false"
                        show-icon
                        style="margin-bottom: 12px;">
                        <template #default>
                            <span style="font-size: 13px;">确认后将使用新文件替换原文件，原文件将被删除</span>
                        </template>
                    </el-alert>
                    
                    <div class="upload-wrapper-edit" :class="{ 'has-file': !!editForm.file }">
                        <el-upload
                            ref="uploadRef"
                            class="upload-dragger-edit"
                            drag
                            action="#"
                            :auto-upload="false"
                            :limit="1"
                            :on-change="handleFileChange"
                            :on-exceed="handleExceed"
                            :on-remove="handleRemove"
                            :show-file-list="false">
                            <div class="upload-inner-edit">
                                <div v-if="!editForm.file" class="upload-empty-edit">
                                    <div class="icon-box-edit">
                                        <el-icon><UploadFilled /></el-icon>
                                    </div>
                                    <div class="upload-text-edit">
                                        <h4>点击或拖拽文件到此处替换</h4>
                                        <p>不上传则保持原文件不变</p>
                                    </div>
                                </div>
                                
                                <!-- 选中文件后的预览 -->
                                <div v-else class="file-selected-edit">
                                    <div class="file-icon-wrapper-edit">
                                        <div class="file-icon-edit">
                                            <el-icon v-if="editForm.category === 1"><Picture /></el-icon>
                                            <el-icon v-else-if="editForm.category === 2"><Document /></el-icon>
                                            <el-icon v-else-if="editForm.category === 3"><VideoPlay /></el-icon>
                                            <el-icon v-else-if="editForm.category === 4"><Headset /></el-icon>
                                            <el-icon v-else><Files /></el-icon>
                                        </div>
                                    </div>
                                    <div class="file-name-edit" :title="editForm.file.name">{{ editForm.file.name }}</div>
                                    <div class="file-actions-edit">
                                        <el-button type="primary" text bg @click.stop="handleRemove">
                                            <el-icon style="margin-right: 4px;"><RefreshLeft /></el-icon>
                                            取消替换
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </el-upload>
                    </div>
                    
                    <!-- 文件元数据 -->
                    <transition name="el-fade-in">
                        <div v-if="editFileInfo" class="file-meta-card-edit">
                            <div class="meta-header-edit">
                                <el-icon><InfoFilled /></el-icon>
                                <span>新文件元数据</span>
                            </div>
                            <div class="meta-grid-edit">
                                <div class="meta-item-edit">
                                    <span class="label">文件大小</span>
                                    <span class="value">{{ formatSize(editFileInfo.size) }}</span>
                                </div>
                                <div class="meta-item-edit">
                                    <span class="label">文件类型</span>
                                    <span class="value">{{ editFileInfo.mimeType || '未知' }}</span>
                                </div>
                                <div class="meta-item-edit full">
                                    <span class="label">智能分类</span>
                                    <span class="value">
                                        <el-tag :type="getCategoryTagType(editForm.category)" effect="plain" round size="small">
                                            {{ getCategoryLabel(editForm.category) }}
                                        </el-tag>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </transition>
                </el-form-item>

                <!-- 文件名 -->
                <el-form-item label="文件名" required>
                    <el-input
                        v-model="editForm.name"
                        placeholder="请输入文件名"
                        prefix-icon="Edit"
                        clearable
                        size="large" />
                </el-form-item>

                <!-- 资源分类 -->
                <el-form-item label="资源分类" required>
                    <el-radio-group v-model="editForm.category" class="category-radio-group-edit">
                        <el-radio-button :value="1">
                            <div class="radio-content-edit"><el-icon><Picture /></el-icon> 图片</div>
                        </el-radio-button>
                        <el-radio-button :value="2">
                            <div class="radio-content-edit"><el-icon><Document /></el-icon> 文档</div>
                        </el-radio-button>
                        <el-radio-button :value="3">
                            <div class="radio-content-edit"><el-icon><VideoPlay /></el-icon> 视频</div>
                        </el-radio-button>
                        <el-radio-button :value="4">
                            <div class="radio-content-edit"><el-icon><Headset /></el-icon> 音频</div>
                        </el-radio-button>
                        <el-radio-button :value="5">
                            <div class="radio-content-edit"><el-icon><More /></el-icon> 其他</div>
                        </el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <!-- 业务标签 -->
                <el-form-item label="业务标签" required>
                    <el-select
                        v-model="editForm.tag"
                        placeholder="请选择或输入标签"
                        allow-create
                        filterable
                        clearable
                        default-first-option
                        size="large"
                        style="width: 100%">
                        <el-option
                            v-for="item in tagOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value" />
                    </el-select>
                    <div class="form-tip-edit">
                        <el-icon><InfoFilled /></el-icon>
                        支持选择已有标签或直接输入新标签
                    </div>
                </el-form-item>

                <!-- 资源描述 -->
                <el-form-item label="资源描述">
                    <el-input
                        v-model="editForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入资源描述或备注信息..."
                        resize="none"
                        maxlength="200"
                        show-word-limit />
                </el-form-item>
            </el-form>
        </template>
    </Dialog>
</template>
<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import {
    Search, Upload, Refresh, FolderOpened,
    Picture, Document, VideoPlay, Headset,
    CopyDocument, Download, UploadFilled, RefreshLeft,
    InfoFilled, Files, More
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Pagination from '@/components/ReuseComponents/Pagination.vue';
import Dialog from '@/components/ReuseComponents/Dialog .vue';
import { getFileList, getTags, deleteFile, updateFile } from '@/API/Resource/FileAPI';
import RouterPush from '@/util/RouterPush';
import { 
    isImage,
    isVideo, 
    isAudio, 
    getFileIcon,
    formatFileSize as formatSize,
    getCategoryLabel,
    getCategoryTagType,
    autoDetectCategory
} from '@/util/resourceUtils';
import { 
    getFileIconClass, 
    getFileTypeTagType, 
    tableRowClassName, 
    generateFileInfoList, 
    formatFileSize } 
from '@/util/fileListUtils';
import formatTime from '@/util/formatTime';
import { useAppStore } from '@/stores';

const appStore = useAppStore()
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

// 编辑对话框状态
const dialogVisible = ref(false);
const uploadRef = ref();
const isUpdating = ref(false);

// 编辑表单数据
const editForm = reactive({
    _id: '',
    file: null,
    name: '',
    category: 5,
    description: '',
    tag: '',
    ext: '',
    size: 0,
    mimeType: '',
    originalUrl: '', // 保存原始URL
    creator:appStore.userInfo.username,// 上传人
});

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
    ElMessageBox.confirm(
        `确定要删除文件 "${row.name}" 吗？\n\n删除操作不可逆，该文件将被永久移除，相关引用也会失效。`,
        '删除确认',
        {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'danger',
            center: true,
            showClose: true,
            closeOnClickModal: false,
            closeOnPressEscape: true
        }
    ).then( () => {
        deleteFile(row._id).then( res => {
            console.log(res);
            if(res.code === 200){
                ElMessage.success('文件删除成功');
                // 如果删除的文件是当前选中的文件，清空选中状态
                if(selectedFile.value && selectedFile.value._id === row._id){
                    selectedFile.value = null;
                }
                fetchData();
            }else{
                ElMessage.error(`文件删除失败: ${res.message}`);
            }
        }).catch( err => {
            console.error(err);
            ElMessage.error('文件删除失败');
        });
    }).catch(() => {
        // 取消删除
        ElMessage.info('已取消删除操作');
    });
};

const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('链接已复制');
    });
};

// 编辑文件处理
const HnadleEditFile = (file) => {
    // 填充表单数据
    Object.assign(editForm, {
        _id: file._id,
        file: null,
        name: file.name,
        category: file.category || 5,
        description: file.description || '',
        tag: file.tag || '',
        ext: file.ext || '',
        size: file.size || 0,
        mimeType: file.mimeType || '',
        originalUrl: file.url
    });
    dialogVisible.value = true;
};

// 文件变动处理（编辑时上传新文件）
const handleFileChange = (uploadFile) => {
    const rawFile = uploadFile.raw;
    if (!rawFile) return;

    editForm.file = rawFile;
    editForm.name = rawFile.name;
    
    // 提取文件扩展名
    const fileName = rawFile.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    editForm.ext = lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : '';
    
    // 填充文件大小和类型
    editForm.size = rawFile.size;
    editForm.mimeType = rawFile.type;

    // 自动识别分类
    editForm.category = autoDetectCategory(rawFile.type, rawFile.name);
    
    ElMessage.success('文件已选择，将替换原文件');
};

// 超出文件数限制处理
const handleExceed = (files) => {
    if (uploadRef.value) {
        uploadRef.value.clearFiles();
        const file = files[0];
        uploadRef.value.handleStart(file);
    }
};

// 移除文件处理
const handleRemove = () => {
    editForm.file = null;
    // 清除upload组件内部文件列表
    if (uploadRef.value) uploadRef.value.clearFiles();
    ElMessage.info('已取消文件替换');
};

// 确认编辑
const handleConfirmEdit = async () => {
    // 表单验证
    if (!editForm.name) {
        ElMessage.warning('请输入文件名');
        return;
    }
    if (!editForm.tag) {
        ElMessage.warning('请选择或输入业务标签');
        return;
    }

    isUpdating.value = true;
    try {
        // 准备提交数据
        // 如果 editForm.file 为 null，后端会知道不需要替换文件
        // 如果 editForm.file 有值，后端会处理新文件上传并替换
        const submitData = {
            _id: editForm._id,
            name: editForm.name,
            category: editForm.category,
            tag: editForm.tag,
            description: editForm.description,
            // 只有当用户选择了新文件时，才包含文件相关信息
            ...(editForm.file && {
                file: editForm.file,
                ext: editForm.ext,
                size: editForm.size,
                mimeType: editForm.mimeType
            })
        };

        const response = await updateFile(submitData);
        if (response.code === 200) {
            ElMessage.success(editForm.file ? '文件替换成功' : '文件信息更新成功');
            dialogVisible.value = false;
            // 刷新列表
            await fetchData();
            // 如果更新的是当前选中的文件，更新选中状态
            if (selectedFile.value && selectedFile.value._id === editForm._id) {
                const updatedFile = tableData.value.find(f => f._id === editForm._id);
                if (updatedFile) {
                    selectedFile.value = updatedFile;
                }
            }
            resetEditForm();
        } else {
            ElMessage.error(`文件更新失败: ${response.message}`);
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('文件更新失败');
    } finally {
        isUpdating.value = false;
    }
};

// 重置编辑表单
const resetEditForm = () => {
    Object.assign(editForm, {
        _id: '',
        file: null,
        name: '',
        category: 5,
        description: '',
        tag: '',
        ext: '',
        size: 0,
        mimeType: '',
        originalUrl: ''
    });
    if (uploadRef.value) uploadRef.value.clearFiles();
};

// TODO 下载
const downloadFile = (file) => {
    ElMessage.info(`开始下载: ${file.name}`);
};

// 文件信息列表
const fileInfoList = computed(() => {
    return generateFileInfoList(selectedFile.value);
});

// 计算属性：编辑表单的文件信息
const editFileInfo = computed(() => {
    if (!editForm.file) return null;
    return {
        size: editForm.file.size,
        mimeType: editForm.file.type,
    };
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

/* ==================== 编辑对话框样式 ==================== */
.edit-form {
    padding: 0 10px;
    max-height: 70vh;
    overflow-y: auto;
}

.edit-form::-webkit-scrollbar {
    width: 6px;
}

.edit-form::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
}

.edit-form::-webkit-scrollbar-thumb:hover {
    background: #c0c4cc;
}

.edit-form :deep(.el-form-item) {
    margin-bottom: 20px;
}

.edit-form :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
}

/* 上传区域样式 */
.upload-wrapper-edit {
    width: 100%;
    min-height: 180px;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 12px;
}

.upload-dragger-edit {
    width: 100%;
    height: 100%;
}

.upload-dragger-edit :deep(.el-upload) {
    width: 100%;
    height: 100%;
}

.upload-dragger-edit :deep(.el-upload-dragger) {
    width: 100%;
    height: 100%;
    min-height: 180px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-dragger-edit :deep(.el-upload-dragger:hover) {
    border-color: #409eff;
    background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.upload-inner-edit {
    text-align: center;
    padding: 20px;
    width: 100%;
}

.upload-empty-edit {
    animation: fadeIn 0.4s ease-in-out;
}

.icon-box-edit {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-block;
}

.upload-dragger-edit :deep(.el-upload-dragger:hover) .icon-box-edit {
    color: #409eff;
    transform: translateY(-4px) scale(1.05);
}

.upload-text-edit h4 {
    margin: 0 0 6px;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
}

.upload-text-edit p {
    margin: 0;
    font-size: 12px;
    color: #909399;
}

/* 文件选中后状态 */
.file-selected-edit {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    animation: slideIn 0.4s ease-out;
}

.file-icon-wrapper-edit {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.file-icon-edit {
    font-size: 32px;
    color: #ffffff;
}

.file-name-edit {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 12px;
    max-width: 85%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-actions-edit {
    margin-top: 6px;
}

/* 元数据卡片 */
.file-meta-card-edit {
    background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
    border-radius: 8px;
    padding: 12px 14px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-top: 12px;
    width: 100%;
}

.meta-header-edit {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.meta-header-edit .el-icon {
    color: #409eff;
    font-size: 14px;
}

.meta-grid-edit {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.meta-item-edit {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid #f0f2f5;
    transition: all 0.2s;
}

.meta-item-edit:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.meta-item-edit.full {
    grid-column: span 2;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.meta-item-edit .label {
    font-size: 12px;
    color: #909399;
    font-weight: 500;
}

.meta-item-edit .value {
    font-size: 13px;
    color: #606266;
    font-weight: 500;
}

/* 分类单选按钮组 */
.category-radio-group-edit {
    width: 100%;
    display: flex;
    gap: 8px;
}

.category-radio-group-edit :deep(.el-radio-button) {
    flex: 1;
}

.category-radio-group-edit :deep(.el-radio-button__inner) {
    width: 100%;
    display: flex;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid #dcdfe6;
    background: #ffffff;
    transition: all 0.2s;
    padding: 8px 10px;
}

.category-radio-group-edit :deep(.el-radio-button__inner:hover) {
    border-color: #409eff;
    background: #ecf5ff;
}

.category-radio-group-edit :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.radio-content-edit {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

/* 提示文本 */
.form-tip-edit {
    margin-top: 6px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;
}

.form-tip-edit .el-icon {
    font-size: 14px;
    color: #409eff;
}

/* 动画 */
.el-fade-in-enter-active,
.el-fade-in-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-fade-in-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.el-fade-in-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>    