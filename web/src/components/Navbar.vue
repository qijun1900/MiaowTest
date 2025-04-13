<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-template-root -->
<template>
    <div class="navbar">
        <el-menu
            :default-active="route.fullPath"
            class="el-menu-demo"
            mode="horizontal"
            :router="true"
        >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/news">新闻中心</el-menu-item>
            <el-menu-item index="/product">产品与服务中心</el-menu-item>
            <el-menu-item class="admin-center" @click="handleLogin">管理中心</el-menu-item>
        </el-menu>
        <div class="right">
            xxx管理系统
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';


const handleLogin = () => {
    window.location.href = "http://localhost:8080"; 
};

const route = useRoute();
</script>

<style scoped lang="scss">
$primary-color: #3498db;  // 主色调改为更柔和的蓝
$text-color: #2c3e50;     // 深灰色文字
$hover-bg: #f8f9fa;       // 悬停背景色

.navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #ffffff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);  // 更柔和的阴影
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;  // 增加左右留白
    height: 64px;      // 稍微增加高度
    font-family: 'Segoe UI', Tahoma, sans-serif;  // 现代字体
}

.el-menu-demo {
    background: transparent;
    border-bottom: none;
    margin-left: 40px;  // 增加左边距
    
    .el-menu-item {
        color: $text-color !important;
        font-size: 15px;  // 稍大字号
        font-weight: 500;
        padding: 0 24px !important;  // 增加间距
        height: 64px;
        letter-spacing: 0.5px;  // 字间距
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:hover {
            color: $primary-color !important;
            background: $hover-bg !important;
            transform: translateY(-2px);  // 悬停微移效果
        }
        
        &.is-active {
            color: $primary-color !important;
            border-bottom: 2px solid $primary-color;
            &::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 50%;
                width: 24px;
                height: 2px;
                background: $primary-color;
                transform: translateX(-50%);
            }
        }
    }
}

.admin-center {
    background: transparent !important;
    color: $primary-color !important;
    border: 1.5px solid rgba($primary-color, 0.3) !important;
    border-radius: 8px;
    margin-left: 24px !important;
    padding: 0 20px !important;
    transition: all 0.3s ease;
    
    &:hover {
        background: $primary-color !important;
        color: white !important;
        border-color: transparent !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba($primary-color, 0.2);
    }
}

.right {
    color: $primary-color;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    position: relative;
    padding-right: 40px;
    
    &::before {  // 装饰线
        content: '';
        position: absolute;
        left: -40px;
        height: 32px;
        width: 1px;
        background: rgba($text-color, 0.1);
    }
}

// 移动端适配（可选）
@media (max-width: 768px) {
    .navbar {
        padding: 0 20px;
    }
    .el-menu-item {
        padding: 0 12px !important;
        font-size: 14px !important;
    }
    .right {
        display: none;
    }
}
</style>