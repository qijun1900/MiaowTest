<!-- 项目标题 -->
<div align="center">
  <h1>🐈️ 题喵喵</h1>
  <p><strong>基于 Uniapp 的跨平台刷题程序</strong></p>
  
  <!-- 二维码预览区域 -->
  <div style="margin-bottom: 20px;">
    <h3>📱 扫码体验</h3>
    <img src="https://img.shields.io/badge/微信小程序-预览体验-brightgreen?style=flat-square&logo=wechat" alt="WeChat Mini Program">
    <br><br>
    <img src="/Img/miaowtest.jpg" alt="微信小程序二维码" width="200" height="200" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <p><em>微信扫一扫，立即体验题喵喵小程序</em></p>
  </div>
  
  <p>
    <img src="https://img.shields.io/badge/version-0.7.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
    <img src="https://img.shields.io/badge/platform-Uniapp-blueviolet.svg" alt="Platform">
    <img src="https://img.shields.io/badge/frontend-Vue3-teal.svg" alt="Vue3">
  </p>
  
  <p>
    <a href="#-功能特性">功能特性</a> •
    <a href="#-技术架构">技术架构</a> •
    <a href="#-快速开始">快速开始</a> •
    <a href="#-项目结构">项目结构</a> •
    <a href="#-多端支持">多端支持</a> •
  </p>
</div>

---

## 🌟 项目简介

**题喵喵** 是一款基于 Uniapp 框架开发的智能刷题/答题系统，采用题型驱动的设计理念，为用户提供高效、便捷的在线学习体验。项目支持多平台部署，包括微信小程序、H5网页、各类小程序平台等，真正实现"一套代码，多端运行"，同时支持微信小程序云托管。

### ✨ 核心亮点

- 🚀 **跨平台兼容**：基于 Uniapp，支持微信、支付宝、百度等主流小程序平台
- 📚 **题型丰富**：支持选择题、填空题、判断题等多种题型
- 🤖 **智能分析**：AI驱动的题目分析和个性化推荐
- 📊 **数据可视化**：详细的练习数据统计和分析
- 🎨 **界面美观**：现代化的UI设计，用户体验优秀
- ⚡ **性能优化**：响应式布局，流畅的交互体验

---

## 🎯 功能特性

### 📱 用户端功能

#### 🏠 首页模块
- **个性化推荐**：基于学习历史的智能题目推荐
- **学习概览**：练习进度、正确率等关键数据展示
- **快捷入口**：常用功能一键直达

#### 📝 题库模块
- **海量题库**：可以添加多个题库
- **智能搜索**：支持关键词搜索
- **题目收藏**：重要题目一键收藏，方便复习
- **错题管理**：手动添加错题，支持错题重做

#### 👤 我的模块
- **微信一键登录**：快速接入用户信息
- **个人信息**：查看和编辑个人资料
- **我的收藏**：查看收藏的题目，收藏的题库
- **我的设置**：修改用户名称性别，退出登录等
- **更多功能**：更多功能开发中

#### 🛠️ 实用工具
- **计时器**：帮助控制答题时间
- **更多...**：更多实用功能待开发，如果有建议或需求，欢迎提issue

### 🎛️ 管理端功能

#### 📊 数据统计面板
- **实时数据监控**：用户活跃度、题库使用情况等
- **可视化图表**：Chart.js驱动的数据展示
- **导出功能**：支持数据导出和分析

#### 📝 题库管理
- **题目CRUD**：支持题目的增删改查
- **题目导入**：支持批量导入题目
- **题目分类**：多级分类体系管理

#### 👥 用户管理
- **用户信息管理**：用户资料查看和编辑
- **学习数据管理**：用户学习记录的详细管理
- **权限控制**：细粒度的权限管理系统

---

## 🏗️ 技术架构

### 🎨 前端技术栈

#### Uniapp 用户端
```
框架核心：Uniapp + Vue3 + Vite
状态管理：Pinia + Pinia持久化插件
UI组件：uView Plus + Element Plus
图表展示：Chart.js
样式预处理：Sass/SCSS
代码规范：ESLint
```

#### Vue3 管理端
```
框架核心：Vue3 + Vite
状态管理：Vuex + Vuex持久化插件
UI组件：Element Plus
图表展示：Chart.js + vue-chartjs
富文本编辑器：wangEditor
样式预处理：Sass/SCSS
代码规范：ESLint
```

### ⚙️ 后端技术栈

```
运行环境：Node.js + Express
数据库：MongoDB + Mongoose
身份认证：JWT Token
文件上传：Multer
AI集成：OpenAI API
环境配置：dotenv
部署支持：Docker + PM2
```

### 🗄️ 数据库设计

#### 核心数据模型
- **用户模型**：用户基本信息、学习数据等
- **题目模型**：题目内容、类型、难度、解析等
- **考试模型**：考试信息、题目关联等
- **问题反馈模型**：用户反馈信息、处理状态等

---

## 🚀 快速开始

### 📋 环境要求

```bash
Node.js >= 16.0.0
npm >= 8.0.0 或 yarn >= 1.22.0
MongoDB >= 4.4
```

### 🔧 安装依赖

#### 1. 安装根目录依赖
```bash
npm install
```

#### 2. 安装后端依赖
```bash
cd node
npm install
```

#### 3. 安装用户端依赖
```bash
cd User-uniapp
npm install
```

#### 4. 安装管理端依赖
```bash
cd AdminWeb
npm install
```

### ⚙️ 环境配置

#### 后端配置
1. 复制环境配置文件：
```bash
cd node
cp .env.example .env
```

#### 前端配置
用户端和管理端的配置文件位于各自的 `src/config/` 目录下，根据实际需求修改API接口地址等配置。

### 🏃‍♂️ 启动项目

#### 方式一：分别启动各个服务
```bash
# 启动后端服务
npm run start:node

# 启动管理端
npm run start:admin

# 启动用户端（微信小程序）
npm run start:uniapp

# 启动用户端（H5）
npm run start:uniapp:h5
```

#### 方式二：一键启动所有服务（Windows）
```bash
npm run serve
```

---

## 📁 项目结构

```
题喵喵/
├── 📱 User-uniapp/                    # Uniapp用户端
│   ├── src/
│   │   ├── API/                       # API接口封装
│   │   ├── components/                # 公共组件
│   │   │   ├── core/                  # 核心组件
│   │   │   ├── modules/               # 功能模块组件
│   │   │   └── plug-in/               # 第三方插件封装
│   │   ├── composables/               # Vue组合式函数
│   │   ├── config/                    # 配置文件
│   │   ├── pages/                     # 页面文件
│   │   │   ├── exam/                  # 考试相关页面
│   │   │   ├── my/                    # 个人中心页面
│   │   │   ├── chat/                  # AI助手页面
│   │   │   └── tools/                 # 工具页面
│   │   ├── stores/                    # Pinia状态管理
│   │   ├── static/                    # 静态资源
│   │   └── util/                      # 工具函数
│   └── manifest.json                  # 应用配置
│
├── 🎛️ AdminWeb/                       # Vue3管理端
│   ├── src/
│   │   ├── API/                       # API接口封装
│   │   ├── assets/                    # 静态资源
│   │   ├── components/                # 公共组件
│   │   ├── composables/               # 组合式函数
│   │   ├── config/                    # 配置文件
│   │   ├── router/                    # 路由配置
│   │   ├── stores/                    # 状态管理
│   │   ├── util/                      # 工具函数
│   │   └── views/                     # 页面视图
│   └── vite.config.js                 # Vite配置
│
├── 🖥️ node/                            # Node.js后端
│   ├── controllers/                   # 控制器层
│   │   ├── admin/                     # 管理端接口
│   │   └── user/                      # 用户端接口
│   ├── models/                        # 数据模型
│   ├── routes/                        # 路由配置
│   ├── services/                      # 业务逻辑层
│   ├── middlewares/                   # 中间件
│   ├── llm/                           # AI服务集成
│   └── config/                        # 配置文件
│
└── 📦 package.json                    # 根目录依赖管理
```

---

## 📱 多端支持

### ✅ 已支持平台

| 平台 | 状态 | 说明 |
|------|------|------|
| 微信小程序 | ✅ | 完整支持，已优化适配 |
| H5网页 | ✅ | h5移动端兼容 |
| APP | ❌ | 优化中 |


### 🔄 构建命令

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5

# 支付宝小程序
npm run build:mp-alipay

# 百度小程序
npm run build:mp-baidu

# 其他平台...
```

---

## 🚀 部署指南

### 🐳 Docker部署

项目提供了完整的Docker支持：

```bash
# 构建镜像
docker build -t answer-system .

# 运行容器
docker-compose up -d
```

### ☁️ 云部署

支持主流云平台部署：
- **微信云托管**： 
- **阿里云**：
- **腾讯云**：
- **华为云**：

详细部署文档请参考 [CLOUD_DEPLOY.md](node/CLOUD_DEPLOY.md)

---

## 🤝 贡献指南

我们欢迎所有形式的贡献，包括但不限于：
- 🐛 **Bug报告**：提交Issue描述问题
- 💡 **功能建议**：提出新功能的想法
- 🔧 **代码贡献**：提交Pull Request
- 📖 **文档改进**：完善项目文档
- 🌍 **国际化**：帮助翻译多语言版本

### 开发流程

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源，详见 [LICENSE](LICENSE) 文件。

---
## ⚠️ 警告
此项目处于开发完善阶段，可能存在一些问题或功能未完全实现。使用前请确保了解项目的风险和限制。

---

## 🙏 致谢

感谢以下开源项目对本项目的支持：

- [Uniapp](https://uniapp.dcloud.io/) - 跨平台应用开发框架
- [Vue3](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue3组件库
- [uView Plus](https://uiadmin.net/uview-plus/) - Uniapp生态UI框架
- [Express](https://expressjs.com/) - Node.js Web应用框架
- [MongoDB](https://www.mongodb.com/) - 文档数据库

---

## 📞 联系我

如有问题(开发/部署)或项目建议，欢迎通过以下方式联系我：

- 📧 **邮箱**：3308837335@qq.com
- 💬 **微信**：18756810208
- 🐛 **Issue**：提交GitHub Issue

<div align="center">
  <p><strong>⭐ 如果这个项目对你有帮助，请给个Star支持一下！</strong></p>
</div>