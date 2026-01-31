<!-- 
    ResourceSelector.vue
    资源选择器组件
    用于在弹窗中选择已上传的图片/文件资源
    
    主要功能：
    1. 标签筛选：左侧展示资源标签，点击可筛选文件
    2. 文件列表：右侧展示文件网格，支持分页和关键词搜索
    3. 文件选择：点击文件选中，点击"确定"返回选中的文件对象
-->
<template>
    <el-dialog
        title="选择资源文件"
        v-model="visible"
        width="960px"
        :close-on-click-modal="false"
        append-to-body
        class="resource-selector-dialog"
        top="5vh"
    >
        <div class="resource-container">
            <!-- 左侧标签筛选 -->
            <div class="tag-sidebar">
                <div class="sidebar-title">资源标签</div>
                <el-scrollbar>
                    <ul class="tag-list">
                        <!-- "全部"选项 -->
                        <li 
                            :class="{ active: currentTag === '' }"
                            @click="handleTagSelect('')"
                        >
                            <span class="tag-text">全部</span>
                        </li>
                        <!-- 动态渲染后端返回的标签列表 -->
                        <li 
                            v-for="tag in tags" 
                            :key="tag"
                            :class="{ active: currentTag === tag }"
                            @click="handleTagSelect(tag)"
                        >
                            <span class="tag-text">{{ tag }}</span>
                        </li>
                    </ul>
                </el-scrollbar>
            </div>

            <!-- 右侧文件列表区域 -->
            <div class="file-content">
                <!-- 顶部搜索栏 -->
                <div class="search-bar">
                    <el-input
                        v-model="searchKeyword"
                        placeholder="搜索文件名..."
                        clearable
                        @clear="handleSearch"
                        @keyup.enter="handleSearch"
                        class="search-input"
                        prefix-icon="Search"
                    >
                    </el-input>
                    <el-button type="primary" @click="handleSearch" class="search-btn">
                        搜索
                    </el-button>
                </div>

                <!-- 文件展示网格 -->
                <div class="file-grid-wrapper" v-loading="loading">
                    <!-- 空状态提示 -->
                    <el-empty v-if="fileList.length === 0" description="暂无资源" :image-size="100" />
                    <!-- 文件列表 -->
                    <el-scrollbar v-else>
                        <div class="file-grid-content">
                            <el-row :gutter="16">
                                <el-col 
                                    v-for="file in fileList" 
                                    :key="file._id" 
                                    :xs="12" :sm="8" :md="6" :lg="6"
                                >
                                    <div 
                                        class="file-item" 
                                        :class="{ selected: selectedFile?._id === file._id }"
                                        @click="selectFile(file)"
                                    >
                                        <!-- 图片预览 -->
                                        <div class="image-wrapper">
                                            <el-image 
                                                :src="file.url" 
                                                fit="scale-down" 
                                                class="file-preview"
                                                loading="lazy"
                                            >
                                                <template #error>
                                                    <div class="image-slot">
                                                        <el-icon><Picture /></el-icon>
                                                    </div>
                                                </template>
                                            </el-image>
                                            <!-- 选中遮罩层 (勾选图标) -->
                                            <div class="selected-overlay" v-if="selectedFile?._id === file._id">
                                                <div class="check-circle">
                                                    <el-icon><Check /></el-icon>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 文件名 -->
                                        <div class="file-info">
                                            <div class="file-name" :title="file.name">{{ file.name }}</div>
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                    </el-scrollbar>
                </div>

                <!-- 底部列表分页 -->
                <div class="pagination-container">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :total="total"
                        layout="total, prev, pager, next"
                        :page-size="12"
                        @current-change="handlePageChange"
                        background
                        size="small"
                    />
                </div>
            </div>
        </div>

        <!-- 弹窗底部操作按钮 -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">取消</el-button>
                <el-button type="primary" @click="confirmSelect" :disabled="!selectedFile">
                    确定选择
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Search, Picture, Check } from '@element-plus/icons-vue';
import { getTags, getFileList } from '@/API/Resource/FileAPI';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'select']);

// 响应式状态定义
const visible = ref(false);        // 弹窗可见性
const tags = ref([]);             // 标签列表
const currentTag = ref('');       // 当前选中的标签
const searchKeyword = ref('');    // 搜索关键词
const fileList = ref([]);         // 文件列表数据
const loading = ref(false);       // 加载状态
const total = ref(0);             // 总文件数
const currentPage = ref(1);       // 当前页码
const pageSize = ref(12);         // 每页数量
const selectedFile = ref(null);   // 当前选中的文件对象

// 监听 props.modelValue 变化，同步 visible 状态
// 当弹窗打开时，初始化数据
watch(() => props.modelValue, (val) => {
    visible.value = val;
    if (val) {
        fetchTags();
        fetchFiles();
        selectedFile.value = null; // 重置选中状态
    }
});

// 监听 visible 变化，通知父组件更新 modelValue
watch(visible, (val) => {
    emit('update:modelValue', val);
});

// 获取资源标签列表
const fetchTags = async () => {
    try {
        const res = await getTags();
        if (Array.isArray(res)) {
             tags.value = res;
        } else if (res.data && Array.isArray(res.data)) {
             tags.value = res.data;
        } else {
             tags.value = [];
        }
    } catch (error) {
        console.error("获取标签失败", error);
    }
};

// 获取文件列表（支持分页、搜索、标签筛选）
const fetchFiles = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value,
            search: searchKeyword.value,
            tag: currentTag.value
        };
        const res = await getFileList(params);
        if (res.data && res.data.list) {
            fileList.value = res.data.list;
            total.value = res.data.total || 0;
        } else {
            fileList.value = [];
            total.value = 0;
        }
    } catch (error) {
        console.error("获取文件列表失败", error);
    } finally {
        loading.value = false;
    }
};

// 处理标签选择点击事件
const handleTagSelect = (tag) => {
    currentTag.value = tag;
    currentPage.value = 1; // 切换标签时重置到第一页
    fetchFiles();
};

// 处理搜索事件
const handleSearch = () => {
    currentPage.value = 1; // 搜索时重置到第一页
    fetchFiles();
};

// 处理分页变化事件
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchFiles();
};

// 选择文件逻辑
const selectFile = (file) => {
    selectedFile.value = file;
};

// 确认选择逻辑
const confirmSelect = () => {
    if (selectedFile.value) {
        emit('select', selectedFile.value); // 触发 select 事件，将选中的文件传递给父组件
        visible.value = false; // 关闭弹窗
    }
};
</script>

<style scoped>
.resource-container {
    display: flex;
    height: 550px;
    border: 1px solid #dcdfe6;
    border-radius: 8px; 
    overflow: hidden;
    background-color: #fff;
}

.tag-sidebar {
    width: 180px;
    flex-shrink: 0;
    border-right: 1px solid #e4e7ed;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
}

.sidebar-title {
    padding: 16px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
    background-color: #f8f9fa;
}

.tag-list {
    list-style: none;
    padding: 8px 0;
    margin: 0;
}

.tag-list li {
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
    color: #606266;
    display: flex;
    align-items: center;
    position: relative;
}

.tag-list li:hover {
    background-color: #ecf5ff;
    color: #409eff;
}

.tag-list li.active {
    background-color: #e6f7ff;
    color: #409eff;
    font-weight: 500;
}

.tag-list li.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: #409eff;
}

.file-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background-color: #fff;
    min-width: 0; /* 防止flex子项溢出 */
}

.search-bar {
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
}

.search-input {
    flex: 1;
    max-width: 300px;
}

.file-grid-wrapper {
    flex: 1;
    overflow: hidden; /* 交给内部 scrollbar */
    position: relative;
    border-radius: 4px;
}

.file-grid-content {
    padding: 4px; /* 留出阴影空间 */
}

.file-item {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 0;
    cursor: pointer;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 16px;
    background: #fff;
    overflow: hidden;
}

.file-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
    border-color: #c0c4cc;
}

.file-item.selected {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
}

.image-wrapper {
    width: 100%;
    height: 140px;
    background-color: #f5f7fa;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.file-preview {
    width: 100%;
    height: 100%;
    display: block;
    transition: transform 0.3s;
}

.file-item:hover .file-preview {
    transform: scale(1.05);
}

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 24px;
}

.file-info {
    padding: 8px 10px;
    border-top: 1px solid #ebeef5;
    background-color: #fff;
}

.file-name {
    font-size: 13px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    line-height: 1.4;
}

.selected-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(64, 158, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}

.check-circle {
    width: 32px;
    height: 32px;
    background-color: #409eff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: zoomIn 0.2s;
}

@keyframes zoomIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
}

.pagination-container {
    margin-top: 16px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
}
</style>