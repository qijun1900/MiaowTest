<template>
    <div>
        <el-page-header content="添加产品" icon="" title="产品管理"></el-page-header>
        <el-form
            ref="productFormRef"
            :model="productForm"
            :rules="productFormrules"
            label-width="auto"
            class="demo-ruleForm">
                <el-form-item 
                    label="产品名称" 
                    prop="title">
                    <el-input v-model="productForm.title" />
                </el-form-item>
                <el-form-item 
                    label="产品简介" 
                    prop="introduction">
                        <el-input v-model="productForm.introduction"
                        type="textarea" />
                </el-form-item>
                <el-form-item 
                    label="产品详细描述" 
                    prop="detail">
                        <el-input v-model="productForm.detail"
                        type="textarea" />
                </el-form-item>
                <el-form-item 
                    label="产品图片" 
                    prop="cover">
                    <Upload 
                    :avatar='productForm.cover'
                    @AvatarChange="handleChange"/>   
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" 
                    @click="submitForm" 
                    class="login-button">
                    添加产品
                    </el-button>
                </el-form-item>
        </el-form>
    </div>
</template>
<script setup>
import { ref,reactive } from 'vue';
import Upload from '@/components/upload/Upload.vue';
import upload from '@/util/upload'
import { useRouter } from 'vue-router';

const router = useRouter()
const productFormRef = ref()
const productForm = reactive({
    title:"",
    introduction:"",
    detail:'',
    cover:"",
    file:null
})
const  productFormrules= reactive({
    title: [
        { 
        required: true,
        message: '请输入名字', 
        trigger: 'blur'    
        }
    ],
    introduction: [
        { 
        required: true,
        message: '请输入介绍', 
        trigger: 'blur'    
        }
    ],
    detail: [
        { 
        required: true,
        message: '请输入详情', 
        trigger: 'blur'    
        }
    ],
    cover: [
        { 
        required: true,
        message: '请上传图片', 
        trigger: 'blur'    
        }
    ],
})

const handleChange = (file)=>{
    productForm.cover = URL.createObjectURL(file)
    productForm.file = file
}

const submitForm = ()=>{
    productFormRef.value.validate(async (valid)=>{
        if(valid){
            console.log(productForm)
            await upload("/adminapi/product/add",productForm)
            router.push('/product/productlist')
        }
    })
} 


</script>

<style scoped lang="scss">
.demo-ruleForm{
    margin-top: 50px;
}


</style>
