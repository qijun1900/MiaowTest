<template>
    <div class="login-container">
        <div class="bg-animation">
            <div class="ball"></div>
            <div class="ball"></div>
            <div class="ball"></div>
            <div class="ball"></div>
        </div>
        
        <div class="login-box">
            <div class="logo-container">
                <img src="@/assets/logo.png" alt="Logo" class="logo">
            </div>
            <h2 class="login-title">
                <el-icon class="title-icon"><UserFilled /></el-icon>
                欢迎登录
            </h2>
            <el-form
                ref="loginFormRef"
                :model="loginForm"
                status-icon
                :rules="loginrules"
                label-width="80px"
                class="demo-ruleForm"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input 
                        v-model="loginForm.username" 
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                    />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>

                <el-form-item label="验证码" prop="vcode">
                    <Vcode
                        :show="isShow"
                        @success="onSuccess"
                        @close="onClose"
                        @fail="onFail"
                    />
                    <el-button @click="showVcode">点击验证</el-button>
                </el-form-item>
                <el-button 
                    type="primary" 
                    @click="submitForm" 
                    class="login-button"
                    :icon="Pointer"
                >
                    立即登录
                </el-button>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import Vcode from "vue3-puzzle-vcode";
import { UserFilled, User, Lock, Pointer } from '@element-plus/icons-vue';
import { reactive, ref } from "vue";
import { ElMessage } from 'element-plus'
import { useAppStore } from '../stores/index'
import { postUserLogin } from "@/API/Login/postUserLogin";
import RouterPush from "@/util/RouterPush";


const appStore = useAppStore()
const isShow = ref(false);
const loginForm = reactive({
    username: "",
    password: "",
    vcode: ""
});
const loginFormRef = ref({});

const showVcode = () => {//显示验证码
    isShow.value = true;
};

const onSuccess = () => {///验证通过
    isShow.value = false;
    loginForm.vcode = "验证通过";
};

const onClose = () => {//关闭验证码
    isShow.value = false;
};

const onFail = () => {//验证失败
    isShow.value = false;
    ElMessage.error("验证失败");
};

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
    vcode: [
        {
            required: true,
            message: "请完成验证",
            trigger: "blur"
        }
    ]
});



const submitForm = () => {
    try {
        loginFormRef.value.validate(async (valid) => {
            if (valid && loginForm.vcode === "验证通过") {
                const res = await postUserLogin(loginForm)
                if(res.ActionType ==="OK"){                 
                    appStore.changeUserInfo({
                        ...res.data,
                    })
                    ElMessage.success("用户登录成功！")
                    RouterPush("/index")
                }else{
                    ElMessage.error("用户名或密码错误！！！")
                }
            } else if (!loginForm.vcode) {
                ElMessage.error("请完成验证");
            }
        });
    } catch (e) {
        console.error("登录失败", e);
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    position: relative;
    overflow: hidden;
}

/* 背景动画效果 */
.bg-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.ball {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,142,255,0.2) 0%, rgba(4,102,249,0.1) 70%, transparent 100%);
    filter: blur(30px);
    animation: float 15s infinite linear;
}

.ball:nth-child(1) {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.ball:nth-child(2) {
    top: 60%;
    left: 70%;
    animation-delay: 3s;
}

.ball:nth-child(3) {
    top: 30%;
    left: 50%;
    animation-delay: 6s;
}

.ball:nth-child(4) {
    top: 80%;
    left: 30%;
    animation-delay: 9s;
}

@keyframes float {
    0% {
        transform: translate(0, 0) rotate(0deg);
    }
    25% {
        transform: translate(50px, 50px) rotate(90deg);
    }
    50% {
        transform: translate(100px, -50px) rotate(180deg);
    }
    75% {
        transform: translate(-50px, -100px) rotate(270deg);
    }
    100% {
        transform: translate(0, 0) rotate(360deg);
    }
}

/* Logo样式 */
.logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 0.1rem;
}

.logo {
    height: 60px;
    width: auto;
    object-fit: contain;
}

/* 调整登录框层级 */
.login-box {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 420px;
    transition: all 0.3s ease;
}

.login-title {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.title-icon {
    font-size: 2rem;
    color: #1a73e8;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #5a5a5a;
}

.login-button {
    width: 100%;
    margin-top: 1rem;
    padding: 12px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(32, 80, 223, 0.3);
}

:deep(.el-input__inner) {
    border-radius: 8px;
    padding: 0.8rem 1rem;
}
</style>