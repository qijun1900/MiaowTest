# 题喵喵 (MiaowTest)

> 基于 Uni-app + Vue3 + Express + MongoDB 的跨平台智能刷题系统

<p align="center">
  <img src="https://img.shields.io/badge/version-1.6.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/frontend-UniApp%20%2B%20Vue3-42b883.svg" alt="Frontend">
  <img src="https://img.shields.io/badge/backend-Express-black.svg" alt="Backend">
</p>

## 小程序扫码体验

<p align="center">
  <img src="https://picui.ogmua.cn/s1/2026/03/27/69c6969558d78.webp" alt="题喵喵微信小程序扫码体验" width="220">
</p>

## 项目概览

题喵喵是一个面向学习与训练场景的全栈答题系统，采用前后端分离与多端统一架构。
项目包含用户端、管理端和后端 API 三大子系统，支持题库管理、练习统计、错题沉淀、AI 能力集成，以及云托管部署。

- 服务端部署补充：见 [node/CLOUD_DEPLOY.md](node/CLOUD_DEPLOY.md)

## 文档导航

- [核心能力](#核心能力)
- [技术架构](#技术架构)
- [仓库结构](#仓库结构)
- [快速开始](#快速开始)
- [运行与构建脚本](#运行与构建脚本)
- [环境变量说明](#环境变量说明)
- [部署指南](#部署指南)
- [平台支持矩阵](#平台支持矩阵)
- [安全与运维建议](#安全与运维建议)
- [路线图](#路线图)
- [贡献指南](#贡献指南)

## 核心能力

### 用户端 (Uni-app)

- 刷题与练习：选择题、填空题、判断题、简答题等题型能力
- 学习资产：收藏、错题、词库等可持续复习链路
- 学习工具：计时器，TODO,错题本等训练辅助模块
- 账号体系：登录态管理（邮箱和微信小程序一键登陆）、个人信息与学习数据展示
- AI 支持：题目分析、扩展问答等能力（持续迭代）

### 管理端 (Vue3)

- 题库管理：题目 CRUD、AI批量一键导入与分类管理
- 用户管理：账号信息、学习记录、行为统计
- 数据看板：图表化展示活跃度、使用趋势等指标
- 资源管理：设立静态资源管理中心
- AI 管理：模型配置与能力接入管理

### 后端服务 (Express)

- REST API：用户端与管理端统一服务入口
- 认证鉴权：JWT + 中间件体系
- 数据存储：MongoDB + Mongoose 数据模型
- 文件能力：本地上传 + OSS + 云托管文件链路
- 部署适配：本地开发、Docker、云托管模式

## 技术架构

| 层级 | 技术方案 |
|---|---|
| 用户端 | Uni-app + Vue3 + Vite + Pinia + uView Plus + uni-ui |
| 管理端 | Vue3 + Vite + Element Plus + Pinia + Chart.js |
| 服务端 | Node.js + Express + Mongoose + JWT + Multer |
| 数据层 | MongoDB |
| AI 能力 | OpenAI SDK / DashScope 相关能力接入 |
| 部署 | Docker / Docker Compose / 微信云托管 |

### 架构关系

1. 用户端与管理端通过 HTTP 调用后端 API。
2. 后端统一处理鉴权、业务编排、数据持久化。
3. 文件资源根据环境走本地存储、OSS 或云托管链路。
4. AI 能力由后端统一接入并向前端提供业务化接口。

## 仓库结构

```text
.
├── User-uniapp/           # 用户端（Uni-app）
├── AdminWeb/              # 管理端（Vue3）
├── node/                  # 后端服务（Express）
├── Img/                   # 项目图片资源
├── LICENSE
├── package.json           # 根目录脚本（聚合启动）
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18（建议与 Dockerfile 保持一致）
- npm >= 8
- MongoDB >= 6（或外部可访问 MongoDB 实例）

### 1) 安装依赖

```bash
# 根目录
npm install

# 后端
cd node
npm install

# 用户端
cd ../User-uniapp
npm install

# 管理端
cd ../AdminWeb
npm install
```

### 2) 配置环境变量

后端模板文件： [node/.env.example](node/.env.example)

Windows PowerShell:

```powershell
cd node
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cd node
cp .env.example .env
```

### 3) 初始化数据库

```bash
cd node
node script/init-database.js
```

### 4) 启动项目

方式 A：按子项目分别启动

```bash
# 后端
cd node
npm run dev

# 管理端
cd ../AdminWeb
npm run dev

# 用户端（微信小程序）
cd ../User-uniapp
npm run dev:mp-weixin

# 用户端（H5）
npm run dev:h5
```

方式 B：根目录一键启动（Windows）

```bash
npm run serve
```

## 运行与构建脚本

### 根目录脚本

| 命令 | 说明 |
|---|---|
| npm run start:node | 启动后端 |
| npm run start:admin | 启动管理端开发服务 |
| npm run start:uniapp | 启动用户端微信小程序开发服务 |
| npm run start:uniapp:h5 | 启动用户端 H5 开发服务 |
| npm run serve | Windows 下一键并行启动多个服务窗口 |

### 后端脚本 (node/package.json)

| 命令 | 说明 |
|---|---|
| npm run dev | 开发模式启动 |
| npm run start | node-dev 启动 |
| npm run prod | 生产模式启动（Windows set 语法） |
| npm run migrate:oss | 迁移资源到 OSS |

### 用户端脚本 (User-uniapp/package.json)

- 开发：dev:h5、dev:mp-weixin、dev:mp-alipay、dev:mp-baidu 等
- 构建：build:h5、build:mp-weixin、build:mp-alipay、build:mp-baidu 等
- 代码质量：lint

### 管理端脚本 (AdminWeb/package.json)

| 命令 | 说明 |
|---|---|
| npm run dev | 本地开发 |
| npm run build | 生产构建 |
| npm run build:analyze | 构建并分析包体积 |
| npm run preview | 预览构建产物 |
| npm run lint | ESLint 修复 |

## 环境变量说明

完整模板见 [node/.env.example](node/.env.example)。

重点分组：

- 基础服务：NODE_ENV、PORT、HOST
- 数据库：MONGO_PROVIDER 及 local/1panel/cloud 对应变量
- 微信能力：WECHAT_APPID、WECHAT_SECRET、CLOUD_ENV
- AI 配置：DASHSCOPE_API_KEY
- 对象存储：OSS_REGION、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET、OSS_BUCKET 等
- 邮件服务：EMAIL_PROVIDER、EMAIL_USER、EMAIL_PASS

安全建议：

1. 禁止提交 .env 到代码仓库。
2. 生产环境全部使用强随机密钥。
3. 优先使用云平台密钥管理服务，不在文档中硬编码敏感信息。

## 部署指南

### Docker Compose（后端 + MongoDB）

Docker 相关文件位于 [node/Dockerfile](node/Dockerfile) 与 [node/docker-compose.yml](node/docker-compose.yml)。

```bash
cd node
docker compose up -d
```

应用默认健康检查端点：

```text
GET /health
```

### 云托管部署

云托管细节请参考 [node/CLOUD_DEPLOY.md](node/CLOUD_DEPLOY.md)。

## 平台支持矩阵

| 平台 | 状态 | 说明 |
|---|---|---|
| 微信小程序 | 稳定 | 当前主力端 |
| H5 | 稳定 | 移动端浏览器场景 |
| 其他小程序平台 | 可构建 | 需按平台规则调试与验收 |
| App (uni-app plus) | 持续适配中 | 已具备基础代码路径，建议专项测试后发布 |

## 安全与运维建议

1. 为登录与高频接口配置限流策略。
2. 使用 helmet、输入清洗、参数校验降低攻击面。
3. 开启日志分级与请求链路追踪，监控 /health 与数据库连通性。
4. 上传链路统一限制文件类型、大小与鉴权范围。
5. 对 AI 调用增加配额控制与失败重试策略。

## 路线图

- 完善 App 端体验与多平台一致性
- 强化 AI 辅学能力（题目讲解、错因分析、学习建议）
- 扩展管理端数据分析维度与导出能力
- 增强自动化测试与 CI/CD 流程

## 贡献指南

欢迎通过 Issue / PR 参与贡献。

建议流程：

1. Fork 仓库并创建分支。
2. 在对应子项目目录完成开发与自测。
3. 提交前执行必要 lint 与构建验证。
4. 提交 PR，说明改动背景、方案与影响范围。

## License

项目基于 MIT 协议开源，见 [LICENSE](LICENSE)。

## 联系方式

- 邮箱：3308837335@qq.com
- 微信：18756810208
- 问题反馈：GitHub Issue

<p align="center"><strong>如果项目对你有帮助，欢迎 Star 支持。</strong></p>