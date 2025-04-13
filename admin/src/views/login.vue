<template>
    <div class="login-container">
          <div class="login-box">
          <h2 class="login-title">欢迎登录</h2>
            <el-form
            ref="loginFormRef"
            :model="loginForm"
            status-icon
            :rules="loginrules"
            label-width="auto"
            class="demo-ruleForm"
            >
              <el-form-item label="用户名" prop="username">
                  <el-input v-model="loginForm.username" autocomplete="off" />
              </el-form-item>
      
              <el-form-item label="密码" prop="password">
                  <el-input v-model="loginForm.password" type="password" autocomplete="off" />
              </el-form-item>
    
              <el-form-item>
                  <el-button type="primary" @click="submitForm" class="login-button">
                  登录
                  </el-button>
              </el-form-item>
            </el-form>
        </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref } from "vue";
  import { useRouter } from "vue-router";
  import axios from 'axios'
  import { ElMessage } from 'element-plus'
  import { useStore } from "vuex";

  const router =useRouter()
  const store = useStore()

  const loginForm = reactive({
    username: "",
    password: "",
  });
  
  const loginFormRef = ref({});
  
  //规则
  const loginrules = reactive({
    username: [
      {
        required: true,
        message: "请输入用户名",
        trigger: "blur",
      },
    ],
    password: [
      {
        required: true,
        message: "请输入密码",
        trigger: "blur",
      },
    ],
  });
  
  const submitForm = () => {
    //1.校验表单
    //2.提交后台
    //3.设置token
    loginFormRef.value.validate((valid)=>{
      if(valid){
        axios.post("/adminapi/user/login",loginForm).then(res=>{
          console.log(res.data)
          if(res.data.ActionType ==="OK"){
            store.commit('changeUserInfo',res.data.data)
            store.commit('ChangesGetterRouter',false) 
            router.push('/index')
          }else{
            ElMessage.error("用户名或密码错误！！！")
          }
        })  
      }
    })
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, rgb(17, 122, 203), rgb(22, 104, 236));
  }

  
  .login-box {
    background: rgba(255, 255, 255, 0.843); /* 白色透明底色 */
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 430px;
    font-size: 18px; /* 整体字体调大 */
  }
  
  .login-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 32px; /* 标题字体调大 */
    color: #393636;
  }
  
  .login-button {
    width: 100%;
    margin-top: 20px;
    font-size: 18px; /* 按钮字体调大 */
  }
  </style>