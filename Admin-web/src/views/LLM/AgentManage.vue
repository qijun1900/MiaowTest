<template>
  <div>
    <transition name="slide-up">
      <el-card style="border-radius: 4px" shadow="never" v-show="showSearch">
        <SearchFilter
          :Data="tableData"
          :filterConfig="[
            {
              type: 'input',
              label: 'Agent名称',
              placeholder: '请输入Agent名称',
              field: 'agentNameSearch', 
              fields: ['agentName'],
            },
            {
              type: 'input',
              label: '业务标识(Key)',
              placeholder: '请输入Agent标识',
              field: 'agentKeySearch',
              fields: ['agentKey'],
            },
            {
              type: 'select',
              label: '状态',
              placeholder: '请选择发布状态',
              field: 'isPublishFilter',
              fields: ['isPublish'],
              options: [
                { label: '未发布', value: 0 },
                { label: '已发布', value: 1 },
              ],
            },
          ]"
          @onsearch="handleOnSearch"
        />
      </el-card>
    </transition>
    <div class="eidt-card">
      <el-card style="border-radius: 4px" shadow="never">
        <div class="edit-btn">
          <el-row :gutter="20" type="flex" justify="space-between" align="middle">
            <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18" class="left-buttons">
              <el-button type="success" plain @click="handleAdd">增加Agent </el-button>
              <Popconfirm title="您确定删除吗？" @confirm="handleDeleteMany">
                <el-button
                  type="danger"
                  plain
                  :disabled="!selectedRows || selectedRows.length === 0"
                  >删除选中
                </el-button>
              </Popconfirm>
            </el-col>
            <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="right-buttons">
              <Tooltip content="隐藏/显示搜索">
                <template #description>
                  <el-button type="primary" :icon="Hide" circle @click="HandleHideSearch" />
                </template>
              </Tooltip>
              <Tooltip content="开启/关闭斑马纹">
                <template #description>
                  <el-button type="primary" :icon="Open" circle @click="handleOpenStripe" />
                </template>
              </Tooltip>
              <Tooltip content="刷新表格">
                <template #description>
                  <el-button
                    type="primary"
                    :icon="RefreshRight"
                    circle
                    @click="handleRefreshAgentData"
                  />
                </template>
              </Tooltip>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
    <div class="edit-table">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        max-height="690"
        :stripe="IsOpenStripe"
        v-loading="tableLoading"
        element-loading-text="加载中..."
      >
        <el-table-column type="selection" width="40" />
        <el-table-column type="index" label="序号" width="60" :index="(index) => index + 1" />
        <el-table-column label="标识 (Key)" width="150" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ scope.row.agentKey }}
          </template>
        </el-table-column>
        <el-table-column label="名称" width="180">
          <template #default="scope">
            {{ scope.row.agentName }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.agentType === 'chat'
                  ? 'success'
                  : scope.row.agentType === 'workflow'
                  ? 'info'
                  : 'warning'
              "
            >
              {{ scope.row.agentType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="底座模型" width="150">
          <template #default="scope">
            {{ scope.row.defaultModel || '默认' }}
          </template>
        </el-table-column>
        <el-table-column label="能力" width="160" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isMultimodal === 1" type="success" size="small" style="margin-right: 4px">多模态</el-tag>
            <el-tag v-if="scope.row.supportThinking === 1" type="warning" size="small">思考</el-tag>
            <span v-if="scope.row.isMultimodal !== 1 && scope.row.supportThinking !== 1" style="color: #c0c4cc">—</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" width="200" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ scope.row.description || "无描述" }}
          </template>
        </el-table-column>
        <el-table-column label="排序" width="80" align="center">
          <template #default="scope">
            {{ scope.row.sort }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150" align="center">
          <template #default="scope">
            <el-switch
              size="large"
              v-model="scope.row.isPublish"
              inline-prompt
              :active-value="1"
              :inactive-value="0"
              active-text="已发布"
              inactive-text="未发布"
              @change="handlePublishChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="260">
          <template #default="scope">
            <el-button type="primary" plain @click="handleEdit(scope.row)" size="small"> 编辑 </el-button>
            <Popconfirm title="您确定删除吗" @confirm="handleDeleteOne(scope.row)">
              <el-button type="danger" plain size="small"> 删除 </el-button>
            </Popconfirm>
            <el-button
              type="success"
              plain
              size="small"
              @click="handleChat(scope.row)"
              :disabled="scope.row.isPublish === 0 || scope.row.agentType !== 'chat'"
            >
              配置测试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <Pagination
        DilogWidth="900px"
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
    <div>
      <Dialog
        :DilogTitle="isEditMode ? '编辑 Agent' : '新增 Agent'"
        :DilogButContent="isEditMode ? '提交更改' : '添加 Agent'"
        :draggable="true"
        DilogWidth="780px"
        v-model="dialogVisible"
        @dialog-confirm="handleConfirm"
      >
        <template #dialogcontent>
          <el-form ref="FormRef" :model="Form" :rules="Formrules" label-width="120px">
            <el-form-item label="业务标识 (Key)" prop="agentKey">
              <el-input v-model="Form.agentKey" placeholder="如 exam-tutor, 一旦使用请尽量保持稳定" :disabled="isEditMode"/>
            </el-form-item>
            <el-form-item label="Agent名称" prop="agentName">
              <el-input v-model="Form.agentName" placeholder="显示用的模块或数字名称" />
            </el-form-item>
            <el-form-item label="Agent类型" prop="agentType">
              <el-select v-model="Form.agentType" placeholder="请选择使用模式">
                <el-option label="对话型 (Chat)" value="chat" />
                <el-option label="工作流型 (Workflow)" value="workflow" />
                <el-option label="工具型 (Tool)" value="tool" />
              </el-select>
            </el-form-item>
            <el-form-item label="底座模型" prop="defaultModel">
              <el-input v-model="Form.defaultModel" placeholder="（可留空），例如 qwen-plus" />
            </el-form-item>
            <el-form-item label="多模态模型" prop="isMultimodal">
              <el-switch
                v-model="Form.isMultimodal"
                :active-value="1"
                :inactive-value="0"
                active-text="支持图片输入"
                inactive-text="仅文本"
              />
            </el-form-item>
            <el-form-item label="深度思考" prop="supportThinking">
              <el-switch
                v-model="Form.supportThinking"
                :active-value="1"
                :inactive-value="0"
                active-text="支持思考链"
                inactive-text="不支持"
              />
              <span style="margin-left: 12px; color: #909399; font-size: 12px;">
                仅对 Qwen3 / DeepSeek-R1 / QwQ 等带 reasoning_content 输出的模型生效
              </span>
            </el-form-item>
            <el-form-item label="一句话描述" prop="description">
              <el-input
                placeholder="简明扼要的说明"
                v-model="Form.description"
                :rows="2"
                type="textarea"
              />
            </el-form-item>
            <el-form-item label="系统提示词" prop="systemPrompt">
              <el-input
                placeholder="大模型的系统设定、回答边界等约束（仅在后端发起对话时使用）"
                v-model="Form.systemPrompt"
                :rows="5"
                type="textarea"
              />
            </el-form-item>
            <el-form-item label="排序值" prop="sort">
               <el-input-number v-model="Form.sort" :min="0" :max="999" />
            </el-form-item>
            <el-form-item label="能力标签" prop="capabilities">
               <el-select
                  v-model="Form.capabilities"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="支持输入创建新的能力标签"
                >
                  <el-option label="对话 (chat)" value="chat" />
                  <el-option label="文档检索 (rag)" value="rag" />
                  <el-option label="工具调用 (tools)" value="tools" />
                </el-select>
            </el-form-item>
          </el-form>
        </template>
      </Dialog>
    </div>
  </div>
</template>
<script setup>
import SearchFilter from "@/components/base/SearchFilter.vue";
import { RefreshRight, Hide, Open } from "@element-plus/icons-vue";
import Tooltip from "@/components/base/BaseTooltip.vue";
import { useTableState } from "@/composables/State/useTableState";
import { useTableActions } from "@/composables/Action/useTableActions";
import Popconfirm from "@/components/base/BasePopconfirm.vue";
import { ref, reactive, defineAsyncComponent, onMounted } from "vue";
import Pagination from "@/components/base/BasePagination.vue";
import { ElMessage } from "element-plus";
import {
  postAddAgent,
  getAgentList,
  updateAgentPublishStatus,
  postDeleteOneAgent,
  postDeleteManyAgent,
  postUpdateAgent,
} from "@/API/LLM/agentAPI"; 
import { useAppStore } from "@/stores";
import RouterPush from "@/util/RouterPush";

// 动态导入较大的组件
const Dialog = defineAsyncComponent(() => import("@/components/base/BaseDialog.vue"));
// UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState();
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions();

const appStore = useAppStore();
const tableData = ref([]);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const isEditMode = ref(false);
const currentEditId = ref(null);

const Form = reactive({
  agentName: "",
  agentKey: "",
  agentType: "chat",
  description: "",
  defaultModel: "",
  systemPrompt: "",
  capabilities: [],
  isPublish: 0,
  isMultimodal: 0,
  supportThinking: 0,
  sort: 0,
  creator: appStore.userInfo.username,
});

const FormRef = ref();

const Formrules = reactive({
  agentName: [
    { required: true, message: "请输入名称", trigger: "blur" },
  ],
  agentKey: [
    { required: true, message: "请输入业务标识", trigger: "blur" },
  ],
});

const resetForm = () => {
  Form.agentName = "";
  Form.agentKey = "";
  Form.agentType = "chat";
  Form.description = "";
  Form.defaultModel = "";
  Form.systemPrompt = "";
  Form.capabilities = [];
  Form.isPublish = 0;
  Form.isMultimodal = 0;
  Form.supportThinking = 0;
  Form.sort = 0;
  isEditMode.value = false;
  currentEditId.value = null;
};

const handleOnSearch = (data) => {
  if (data.length === 0) {
    ElMessage.error("未搜索到该信息");
  } else {
    tableData.value = data;
  }
};

const handlePageChange = ({ page, size }) => {
  currentPage.value = page;
  pageSize.value = size;
  handleRefreshAgentData(); 
};

const handleDeleteOne = async (row) => {
  await handleDelete(row, postDeleteOneAgent);
  handleRefreshAgentData();
};

const handleDeleteMany = async () => {
  await handleDelete(selectedRows.value, postDeleteManyAgent);
  handleRefreshAgentData();
};

const handlePublishChange = async (row) => {
  try {
    const res = await updateAgentPublishStatus(row._id, row.isPublish);
    if (res.code === 200) {
      ElMessage.success("状态更新成功");
    }
  } catch (error) {
    ElMessage.error("状态更新失败");
    console.error("状态更新失败:", error);
  }
};

const handleEdit = (row) => {
  dialogVisible.value = true;
  isEditMode.value = true;
  currentEditId.value = row._id;
  Form.agentName = row.agentName;
  Form.agentKey = row.agentKey;
  Form.agentType = row.agentType || 'chat';
  Form.description = row.description;
  Form.defaultModel = row.defaultModel;
  Form.systemPrompt = row.systemPrompt;
  Form.capabilities = row.capabilities || [];
  Form.isMultimodal = row.isMultimodal || 0;
  Form.supportThinking = row.supportThinking || 0;
  Form.sort = row.sort || 0;
};

const handleAdd = () => {
  dialogVisible.value = true;
};

const handleChat = (row) => {
  RouterPush("/agent/chat", { agentKey: row.agentKey });
};

const handleConfirm = async () => {
  try {
    const submitData = { ...Form, _id: currentEditId.value };
    const valid = await FormRef.value.validate();
    if (!valid) {
      ElMessage.error("请填写完整信息");
      return;
    }
    if (isEditMode.value) {
      const res = await postUpdateAgent(submitData);
      if (res.code === 200) {
        ElMessage.success("Agent更新成功");
        dialogVisible.value = false;
        resetForm();
        handleRefreshAgentData(); 
      }
    } else {
      const res = await postAddAgent(submitData);
      if (res.code === 200) {
        ElMessage.success("Agent添加成功");
        resetForm();
        dialogVisible.value = false;
        handleRefreshAgentData(); 
      }
    }
  } catch (error) {
    console.error("提交失败:", error);
  }
};

const handleRefreshAgentData = async () => {
  tableLoading.value = true;
  try {
    const res = await handleRefresh(
      {
        page: currentPage.value,
        size: pageSize.value,
      },
      getAgentList,
    );
    if (res.code === 200) {
      tableData.value = res.data.data;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error("刷新数据失败:", error);
  } finally {
    tableLoading.value = false;
  }
};
onMounted(() => {
  handleRefreshAgentData();
});
</script>
<style scoped>
.eidt-card {
  margin-top: 10px;
}

.edit-btn {
  width: 100%;
}

.left-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 4px 0;
}

.right-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 0;
}

@media (max-width: 768px) {
  .left-buttons,
  .right-buttons {
    justify-content: center;
    margin: 8px 0;
  }
}

.edit-table { margin-top: 10px; }
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-table__header th) {
  background-color: #f5f7fa !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-in-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>