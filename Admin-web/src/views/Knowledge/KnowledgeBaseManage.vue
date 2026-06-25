<template>
  <div class="kb-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">知识库管理</h2>
        <span class="page-desc">创建和管理知识库，每个知识库对应独立的向量存储空间</span>
      </div>
      <div class="header-right">
        <el-button :icon="RefreshRight" circle @click="loadData" :loading="tableLoading" />
        <el-button type="primary" :icon="Plus" @click="handleAdd">新建知识库</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ tableData.length }}</span>
        <span class="stat-label">知识库总数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalDocs }}</span>
        <span class="stat-label">文档总数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ activeKBCount }}</span>
        <span class="stat-label">含文档的知识库</span>
      </div>
    </div>

    <!-- 知识库卡片网格 -->
    <div v-loading="tableLoading" element-loading-text="加载中...">
      <div v-if="tableData.length > 0" class="kb-grid">
        <div v-for="kb in tableData" :key="kb._id" class="kb-card">
          <div class="kb-card-header">
            <div class="kb-icon">
              <el-icon :size="24"><Collection /></el-icon>
            </div>
            <el-dropdown trigger="click" @command="(cmd) => handleCardAction(cmd, kb)">
              <el-button link>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="rag">
                    <el-icon><ChatDotRound /></el-icon>RAG 测试
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <span style="color: #f56c6c"><el-icon><Delete /></el-icon>删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="kb-card-body">
            <h3 class="kb-name">{{ kb.name }}</h3>
            <p class="kb-desc">{{ kb.description || '暂无描述' }}</p>
          </div>

          <div class="kb-card-footer">
            <div class="kb-meta">
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                {{ kb.docCount ?? 0 }} 篇文档
              </span>
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ kb.creator || '—' }}
              </span>
            </div>
            <div class="kb-time">
              {{ formatTime.getTime2(kb.createTime) }}
            </div>
          </div>

          <div class="kb-card-actions">
            <el-button type="primary" plain size="small" @click="handleEdit(kb)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <Popconfirm
              title="确定删除此知识库？该知识库下的所有文档和向量数据都将被清除！"
              @confirm="handleDelete(kb)"
            >
              <el-button type="danger" plain size="small">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </Popconfirm>
          </div>
        </div>
      </div>

      <!-- 空态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无知识库">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>创建第一个知识库
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>

  <!-- 新建/编辑对话框 -->
  <Dialog
    :DilogTitle="isEditMode ? '编辑知识库' : '新建知识库'"
    :DilogButContent="isEditMode ? '保存' : '创建'"
    DilogWidth="520px"
    :draggable="true"
    v-model="dialogVisible"
    @dialog-confirm="handleConfirm"
  >
    <template #dialogcontent>
      <el-form ref="FormRef" :model="Form" :rules="Formrules" label-position="top">
        <el-form-item label="知识库名称" prop="name">
          <el-input
            v-model="Form.name"
            placeholder="例如：计算机网络、数据结构与算法"
            :maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="Form.description"
            type="textarea"
            :rows="3"
            placeholder="可选，描述知识库的用途和覆盖范围"
            :maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </template>
  </Dialog>
</template>

<script setup>
import { RefreshRight, Plus, MoreFilled, Edit, Delete, Document, User, Collection, ChatDotRound } from "@element-plus/icons-vue";
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  postAddKnowledgeBase,
  getKnowledgeBaseList,
  postDeleteKnowledgeBase,
  postUpdateKnowledgeBase,
} from "@/API/Knowledge/knowledgeAPI";
import { useAppStore } from "@/stores";
import formatTime from "@/util/formatTime";
import Popconfirm from "@/components/ReuseComponents/Popconfirm.vue";
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";

const Dialog = defineAsyncComponent(() => import("@/components/ReuseComponents/Dialog .vue"));

const appStore = useAppStore();
const router = useRouter();
const tableData = ref([]);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentEditId = ref(null);
const FormRef = ref();

const Form = reactive({
  name: "",
  description: "",
});

const Formrules = {
  name: [{ required: true, message: "请输入知识库名称", trigger: "blur" }],
};

const totalDocs = computed(() =>
  tableData.value.reduce((sum, kb) => sum + (kb.docCount || 0), 0)
);

const activeKBCount = computed(() =>
  tableData.value.filter((kb) => (kb.docCount || 0) > 0).length
);

const handleAdd = () => {
  isEditMode.value = false;
  currentEditId.value = null;
  Form.name = "";
  Form.description = "";
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEditMode.value = true;
  currentEditId.value = row._id;
  Form.name = row.name;
  Form.description = row.description || "";
  dialogVisible.value = true;
};

const handleCardAction = (cmd, kb) => {
  if (cmd === "edit") handleEdit(kb);
  else if (cmd === "delete") handleDelete(kb);
  else if (cmd === "rag") {
    router.push({ path: "/index/ragtest", query: { kbId: kb._id } });
  }
};

const handleConfirm = async () => {
  try {
    const valid = await FormRef.value.validate();
    if (!valid) return;

    dialogVisible.value = false;

    if (isEditMode.value) {
      const res = await postUpdateKnowledgeBase(currentEditId.value, Form.name, Form.description);
      if (res) {
        ElMessage.success("更新成功");
        await loadData();
      }
    } else {
      const res = await postAddKnowledgeBase(Form.name, Form.description, appStore.userInfo.username);
      if (res) {
        ElMessage.success("知识库创建成功");
        await loadData();
      }
    }
  } catch (error) {
    ElMessage.error(isEditMode.value ? "更新失败" : "创建失败");
    console.error(error);
  }
};

const handleDelete = async (row) => {
  try {
    await postDeleteKnowledgeBase(row._id);
    ElMessage.success("删除成功");
    await loadData();
  } catch (error) {
    ElMessage.error("删除失败");
    console.error(error);
  }
};

const loadData = async () => {
  tableLoading.value = true;
  try {
    const res = await getKnowledgeBaseList();
    if (res) {
      tableData.value = res.data;
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.kb-manage-page {
  padding: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-desc {
  font-size: 13px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  flex: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

/* 卡片网格 */
.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.kb-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.kb-card:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.kb-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kb-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ecf5ff 0%, #e0ecff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.kb-card-body {
  flex: 1;
}

.kb-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kb-desc {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kb-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

.kb-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.kb-time {
  font-size: 12px;
  color: #c0c4cc;
}

.kb-card-actions {
  display: flex;
  gap: 8px;
}

/* 空态 */
.empty-state {
  padding: 80px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .stats-bar {
    flex-direction: column;
  }

  .kb-grid {
    grid-template-columns: 1fr;
  }
}
</style>
