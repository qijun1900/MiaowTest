<template>
    <div>
    <el-page-header   title="考试管理" @back="handleBack()">
        <template #content>
        <div class="flex items-center">
            <el-icon class="mr-2"><DocumentAdd /></el-icon>
            <span class="text-xl font-bold">编辑考试科目</span>
        </div>
        </template>
    </el-page-header>
    
    <el-divider />
    
    <el-form
        ref="subjectFormRef"
        :model="subjectForm"
        :rules="subjectFormrules"
        label-width="120px"
        class="demo-ruleForm px-4"
        label-position="top">
        
        <el-row :gutter="40">
            <el-col :span="12">
            <el-form-item 
                label="考试科目名称" 
                prop="name">
                <template #label>
                    <el-icon class="mr-2"><User /></el-icon>
                    <span>科目名称</span>
                </template>
                <el-input v-model="subjectForm.name" placeholder="请输入考试科目名称" />
            </el-form-item>
            </el-col>

            <el-col :span="12">
            <el-form-item
                label="考试科目代码"
                prop="code">
                <template #label>
                    <el-icon class="mr-2"><Document /></el-icon>
                    <span>科目代码</span>
                </template>
                <el-input 
                    v-model="subjectForm.code" 
                    show-word-limit 
                    maxlength="10"
                    placeholder="请输入科目代码"
                    />
            </el-form-item>
            </el-col>
        </el-row>

        <el-row :gutter="40">
            <el-col :span="12">
            <el-form-item
                label="题目类型(可多个选择)"
                prop="category">
                <template #label>
                    <el-icon class="mr-2"><List /></el-icon>
                    <span>题目类型</span>
                </template>
                <el-select
                    v-model="subjectForm.category"
                    multiple
                    value-format="number"  
                    placeholder="请选择题目类型"
                    style="width: 100%">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"/>
                </el-select>
            </el-form-item>
            </el-col>
            
            <el-col :span="12">
            <el-form-item label="考试年份" prop="year">
                <template #label>
                    <el-icon class="mr-2"><Calendar /></el-icon>
                    <span>考试年份</span>
                </template>
                <el-date-picker
                    v-model="subjectForm.year"
                    type="year"
                    value-format="YYYY"
                    placeholder="选择年份"
                    style="width: 100%"
                />
            </el-form-item>
            </el-col>
        </el-row>

        <el-form-item 
                label="封面" 
                prop="cover">
                <template #label>
                    <el-icon class="mr-2"><Picture /></el-icon>
                    <span>考试封面</span>
                </template>
                <Upload 
                    :avatar='subjectForm.cover'
                    @AvatarChange="handleChange"/> 
        </el-form-item>
        
        <el-form-item>
            <el-row :gutter="20" class="w-full">
              <el-space :size="30" spacer="|">      
                <el-col :span="12">
                    <el-button 
                        type="primary" 
                        @click="submitForm" 
                        class="w-full"
                        size="large"
                        :icon="Plus">
                        更新信息
                    </el-button>
                </el-col>
                <el-col :span="12">
                    <el-button
                        type="danger"
                        @click="dialogVisible = true"
                        class="w-full"
                        size="large"
                        :icon="Delete">
                        删除科目
                    </el-button>
                </el-col>
              </el-space>
            </el-row>
        </el-form-item>
    </el-form> 
      <el-dialog
      v-model="dialogVisible"
      title="Tips"
      width="500">
      <span>你确定要删除吗?(此操作不可逆！)</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDelete">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog> 
</div>
</template>
   
<script setup>
import { DocumentAdd, User, Document, List, Calendar, Picture, Plus, Delete } from '@element-plus/icons-vue'
import { ref,reactive, onMounted } from 'vue';
import Upload from '@/components/upload/Upload.vue';
import upload from '@/util/upload'
import { useRouter,useRoute } from 'vue-router'; 
import axios from 'axios';
import { ElMessage } from 'element-plus'


const dialogVisible = ref(false)
const router = useRouter()
const route = useRoute()  // 添加这行获取路由参数
const subjectFormRef = ref()
const subjectForm  = reactive({
    name:"",
    code:"",
    category:[],
    year:"",
    isPublish:0,
    cover:"",
    file:null,
})
const subjectFormrules = reactive({
    name:[
        {
        required: true,
        message: '请输入科目名称',
        trigger: 'blur'
        }
    ],
    code:[
        {
        required: true,
        message: '请输入科目代码',
        trigger: 'blur'
        }
    ],
    category:[
        {
        required: true,
        message: '请添加择题目类别',
        trigger: 'blur'
        }
    ],
    year:[
        {
        required: true,
        message: '请选择年份',
        trigger: 'blur'
        }
    ],
    cover:[
        {
        required: true,
        message: '请选择图片',
        trigger: 'blur' 
        } 
    ]
})

const options = [
    {
    label: '选择类题',
    value: 1,
    },
    {
    label: '填空类题',
    value: 2,
    },
    {
    label: '判断类题',
    value: 3,
    },
    {
    label: '简答类题',
    value: 4,
    },
    {
    label: '其他类型',
    value: 5, 
    }
]

const handleChange = (file)=>{
    subjectForm.cover = URL.createObjectURL(file)
    subjectForm.file = file
}

// 添加返回方法
const handleBack = () => {
    router.back()
}

//向后端请求数据加载数据
const getData = async () => {
    const res = await axios.get(`/adminapi/exam/list/${route.params.id}`)
    Object.assign(subjectForm, res.data.data[0])//将 res.data.data[0] 对象的所有可枚举属性复制到 subjectForm 对象中
}

//数据加载
onMounted(async ()=>{
    getData()
})

//数据更新,使用upload函数
const submitForm = ()=>{
    subjectFormRef.value.validate( async(valid)=>{
      if(valid){
        const formData = {
        ...subjectForm,
        category: JSON.stringify(subjectForm.category) // 序列化数组
        }
        await upload("/adminapi/exam/update",formData)
        router.back()
      }
    })
}

//添加删除方法
const handleDelete = async () => {
  try {
    await axios.delete(`/adminapi/exam/list/${route.params.id}`)
    ElMessage.success('删除成功')
    router.back()
  } catch (err) {
    ElMessage.error('删除失败')
  } finally {
    dialogVisible.value = false
  }
}
</script>


<style scoped>
   /* 页面容器调整 */
   :deep(.el-page-header__header) {
     padding: 20px 40px;
   }
   
   :deep(.el-page-header__content) {
     color: #409eff;
   }
   
   /* 原有最后两个重复的样式声明合并 */
   :deep(.el-form-item__label) {
     font-weight: 600;
     color: #606266;
   }
   
   .demo-ruleForm {
     max-width: 1200px;
     margin: 0 auto;
   }
   
   /* 分割线样式 */
   .el-divider {
     margin: 10px 0;
   }
   
   /* 表单元素统一间距 */
   :deep(.el-form-item) {
     margin-bottom: 32px;
   }
   
   /* 输入框样式强化 */
   :deep(.el-input__inner) {
     border-radius: 8px;
     height: 42px;
     transition: all 0.3s ease;
   }
   
   :deep(.el-input__inner:hover) {
     border-color: #409eff;
   }
   
   /* 选择器下拉框样式 */
   :deep(.el-select__tags) {
     max-width: 90%;
   }
   
   /* 日期选择器宽度适配 */
   :deep(.el-date-editor) {
     width: 100%;
   }
   
   /* 按钮交互动画 */
   :deep(.el-button) {
     transition: all 0.3s ease;
     letter-spacing: 1px;
   }
   
   :deep(.el-button:hover) {
     transform: translateY(-2px);
     box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
   }
   
   /* 响应式调整 */
   @media (max-width: 768px) {
     .el-col {
       margin-bottom: 24px;
     }
     
     :deep(.el-form-item__label) {
       margin-bottom: 8px !important;
     }
     
     .demo-ruleForm {
       padding: 0 15px;
     }
   }
   
   /* 图标与文字对齐调整 */
   .el-icon {
     vertical-align: middle;
     font-size: 1.1em;
   }
   
   /* 上传组件容器 */
   .upload-container {
     border: 2px dashed #e6e6e6;
     border-radius: 8px;
     padding: 20px;
     transition: border-color 0.3s;
   }
   
   .upload-container:hover {
     border-color: #409eff;
   }
</style> 