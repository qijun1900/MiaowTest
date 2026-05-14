# 题喵喵 (MiaowTest)

> 基于 Uni-app + Vue3 + Express + MongoDB + LangChain 的跨平台智能刷题系统

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/frontend-UniApp%20%2B%20Vue3-42b883.svg" alt="Frontend">
  <img src="https://img.shields.io/badge/backend-Express-black.svg" alt="Backend">
  <img src="https://img.shields.io/badge/AI-LangChain%20%2B%20DashScope-ff6b00.svg" alt="AI">
</p>

## 小程序扫码体验(平台限制AI功能展示不了)

<p align="center">
  <img src="https://free.picui.cn/free/2026/04/18/69e3960545c05.jpg" alt="题喵喵微信小程序扫码体验" width="220">
</p>

## 项目概览

题喵喵是一个面向学习与训练场景的全栈答题系统，采用前后端分离与多端统一架构。
项目包含用户端、管理端和后端 API 三大子系统，支持题库管理、练习统计、错题沉淀、AI 对话、深度思考、流式输出等能力，以及云托管部署。

- 服务端部署补充：见 [Express-node/CLOUD_DEPLOY.md](Express-node/CLOUD_DEPLOY.md)

## 文档导航

- [核心能力](#核心能力)
- [LLM/AI 架构](#llm-ai-架构)
- [技术架构](#技术架构)
- [仓库结构](#仓库结构)
- [快速开始](#快速开始)
- [运行与构建脚本](#运行与构建脚本)
- [环境变量说明](#环境变量说明)
- [部署指南](#部署指南)
- [平台支持矩阵](#平台支持矩阵)
- [安全与运维建议](#安全与运维建议)
- [开发计划](#开发计划)
- [贡献指南](#贡献指南)

## 核心能力

### 用户端 (Uni-app)

- **智能对话 (Mio)**：基于 LangChain 的多轮 AI 对话，支持流式输出（SSE / WebSocket / 小程序分块传输自适应）
- **深度思考**：接入 DeepSeek-R1 等推理模型，实时展示思考过程与最终答案的分离渲染
- **会话管理**：会话创建、重命名、删除、收藏、搜索（标题 + 消息预览模糊匹配）
- **消息分页**：历史消息分页加载，支持骨架屏与竞态防护
- **刷题与练习**：选择题、填空题、判断题、简答题等题型能力
- **学习资产**：收藏、错题、词库等可持续复习链路
- **学习工具**：计时器、TODO、错题本、笔记本等训练辅助模块
- **账号体系**：登录态管理（邮箱和微信小程序一键登录）、个人信息与学习数据展示

### 管理端 (Vue3)

- **Agent 管理**：AI Agent 定义的 CRUD，配置系统提示词、默认模型、能力标签
- **题库管理**：题目 CRUD、AI 批量一键导入与分类管理
- **AI 题目分析**：调用 DashScope 百炼应用自动分析题目质量与知识点
- **用户管理**：账号信息、学习记录、行为统计
- **数据看板**：图表化展示活跃度、使用趋势等指标
- **资源管理**：设立静态资源管理中心

### 后端服务 (Express)

- **LLM 引擎**：LangChain.js + DashScope（阿里云）统一模型接入层
- **Agent 链**：多轮对话链（LCEL 管道）、流式 token 回调、会话标题自动生成
- **推理链**：DeepSeek-R1 等推理模型支持，思考内容与回答内容分离输出
- **对话持久化**：会话 + 消息双表模型，支持分页、收藏、软删除、token 统计
- **REST API**：用户端与管理端统一服务入口
- **认证鉴权**：JWT + 中间件体系（token 刷新、可选鉴权、UID 提取）
- **数据存储**：MongoDB + Mongoose 数据模型（30+ 模型）
- **文件能力**：本地上传 + OSS + 云托管文件链路
- **部署适配**：本地开发、Docker、云托管模式

## LLM/AI 架构

后端 LLM 模块位于 `Express-node/llm/`，基于 LangChain.js 构建，使用 LCEL（LangChain Expression Language）管道语法。

### 模块结构

```
llm/
├── models/factory.js          # ModelFactory — 统一模型工厂（DashScope OpenAI 兼容接口）
├── chains/
│   ├── conversational/
│   │   ├── chat.js            # 单轮对话链（无状态）
│   │   └── deepThink.js       # 推理模型链（DeepSeek-R1/QwQ，思考/回答分离流式输出）
│   └── agent/
│       └── agentChat.js       # 多轮 Agent 链（历史解析 + 流式 + 标题生成）
├── prompts/templates/         # 系统提示词模板（基础对话 / 记忆对话 / 题目生成）
├── admin/ModelApp/            # DashScope 百炼应用集成（题目分析 / AI 导题）
├── agents/                    # [规划中] Agent 工具与工作流
├── memory/                    # [规划中] 对话记忆（缓冲 / 摘要 / 向量）
├── vectorstores/              # [规划中] 向量存储与检索（RAG）
├── loaders/                   # [规划中] 文档加载器（PDF / Web / 数据库）
└── splitters/                 # [规划中] 文本分割器
```

### 对话链路

```
用户消息 → LLMController → LLMService
  ├── ensureConversation()       — 自动创建/更新会话
  ├── saveUserMessage()          — 持久化用户消息
  ├── fetchHistory()             — 加载最近 20 条历史
  ├── streamAgentChain()         — LangChain 流式推理
  │     └── ModelFactory.getModel()  → DashScope API
  ├── saveAIReply()              — 持久化 AI 回复
  └── maybeGenerateTitle()       — 异步生成会话标题（fire-and-forget）
```

### 支持模型

| 模型 | 用途 | 特点 |
|------|------|------|
| qwen-plus | 默认对话模型 | 通用能力强，响应快 |
| deepseek-r1 | 推理/深度思考 | 思维链推理，支持思考过程展示 |
| 其他 DashScope 兼容模型 | 按需切换 | 通过 ModelFactory 动态指定 |

### 前端流式传输

用户端实现了跨平台统一流式传输层 (`streamTransport.js`)：

| 平台 | 传输方式 |
|------|---------|
| H5 | SSE (Server-Sent Events) |
| 微信小程序 | 分块传输 (Chunked Response) |
| APP | WebSocket |

## 技术架构

| 层级 | 技术方案 |
|------|---------|
| 用户端 | Uni-app + Vue3 + Vite + Pinia + uView Plus + uni-ui |
| 管理端 | Vue3 + Vite + Element Plus + Pinia + Chart.js |
| 服务端 | Node.js + Express + Mongoose + JWT + Multer |
| 数据层 | MongoDB |
| AI 引擎 | LangChain.js + DashScope（阿里云通义千问） |
| 部署 | Docker / Docker Compose / 微信云托管 |

### 架构关系

1. 用户端与管理端通过 HTTP 调用后端 API。
2. 后端统一处理鉴权、业务编排、数据持久化。
3. LLM 调用通过 LangChain 管道统一封装，支持同步与流式两种模式。
4. 文件资源根据环境走本地存储、OSS 或云托管链路。
5. AI 能力由后端统一接入并向前端提供业务化接口。

## 仓库结构

```text
.
├── User-uniapp/           # 用户端（Uni-app）
├── Admin-web/             # 管理端（Vue3）
├── Express-node/          # 后端服务（Express）
│   ├── llm/               # LLM 引擎（LangChain + DashScope）
│   ├── models/            # Mongoose 数据模型（30+）
│   ├── services/          # 业务服务层
│   ├── controllers/       # 控制器层
│   ├── routes/            # 路由定义
│   └── config/            # 配置（数据库、LLM、OSS 等）
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
cd Express-node
npm install

# 用户端
cd ../User-uniapp
npm install

# 管理端
cd ../Admin-web
npm install
```

### 2) 配置环境变量

后端模板文件： [Express-node/.env.example](Express-node/.env.example)

Windows PowerShell:

```powershell
cd Express-node
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cd Express-node
cp .env.example .env
```

关键配置项：

```env
# 数据库
MONGO_PROVIDER=local          # local / 1panel / cloud
MONGO_URI=mongodb://localhost:27017/miaowtest

# AI / LLM
DASHSCOPE_API_KEY=sk-xxx      # 阿里云 DashScope API Key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus     # 默认对话模型

# 微信小程序
WECHAT_APPID=xxx
WECHAT_SECRET=xxx
```

### 3) 初始化数据库

```bash
cd Express-node
node script/init-database.js
```

### 4) 启动项目

方式 A：按子项目分别启动

```bash
# 后端
cd Express-node
npm run dev

# 管理端
cd ../Admin-web
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
|------|------|
| npm run start:node | 启动后端 |
| npm run start:admin | 启动管理端开发服务 |
| npm run start:uniapp | 启动用户端微信小程序开发服务 |
| npm run start:uniapp:h5 | 启动用户端 H5 开发服务 |
| npm run serve | Windows 下一键并行启动多个服务窗口 |

### 后端脚本 (Express-node/package.json)

| 命令 | 说明 |
|------|------|
| npm run dev | 开发模式启动（node-dev 热重载） |
| npm run start | 同 dev |
| npm run prod | 生产模式启动 |
| npm run migrate:oss | 迁移资源到 OSS |

### 用户端脚本 (User-uniapp/package.json)

- 开发：dev:h5、dev:mp-weixin、dev:mp-alipay、dev:mp-baidu 等
- 构建：build:h5、build:mp-weixin、build:mp-alipay、build:mp-baidu 等
- 代码质量：lint

### 管理端脚本 (Admin-web/package.json)

| 命令 | 说明 |
|------|------|
| npm run dev | 本地开发 |
| npm run build | 生产构建 |
| npm run build:analyze | 构建并分析包体积 |
| npm run preview | 预览构建产物 |
| npm run lint | ESLint 修复 |

## 环境变量说明

完整模板见 [Express-node/.env.example](Express-node/.env.example)。

重点分组：

- 基础服务：NODE_ENV、PORT、HOST
- 数据库：MONGO_PROVIDER 及 local/1panel/cloud 对应变量
- 微信能力：WECHAT_APPID、WECHAT_SECRET、CLOUD_ENV
- AI / LLM：DASHSCOPE_API_KEY、DASHSCOPE_BASE_URL、DASHSCOPE_MODEL
- 对象存储：OSS_REGION、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET、OSS_BUCKET 等
- 邮件服务：EMAIL_PROVIDER、EMAIL_USER、EMAIL_PASS

安全建议：

1. 禁止提交 .env 到代码仓库。
2. 生产环境全部使用强随机密钥。
3. 优先使用云平台密钥管理服务，不在文档中硬编码敏感信息。

## 部署指南

### Docker Compose（后端 + MongoDB）

Docker 相关文件位于 [Express-node/Dockerfile](Express-node/Dockerfile) 与 [Express-node/docker-compose.yml](Express-node/docker-compose.yml)。

```bash
cd Express-node
docker compose up -d
```

应用默认健康检查端点：

```text
GET /health
```

### 云托管部署

云托管细节请参考 [Express-node/CLOUD_DEPLOY.md](Express-node/CLOUD_DEPLOY.md)。

## 平台支持矩阵

| 平台 | 状态 | 说明 |
|------|------|------|
| 微信小程序 | 稳定 | 当前主力端，AI 对话完整支持 |
| H5 | 稳定 | 移动端浏览器场景，SSE 流式输出 |
| 其他小程序平台 | 可构建 | 需按平台规则调试与验收 |
| App (uni-app plus) | 持续适配中 | WebSocket 流式传输，已具备基础代码路径 |

## 安全与运维建议

1. 为登录与高频接口配置限流策略。
2. 使用 helmet、输入清洗、参数校验降低攻击面。
3. 开启日志分级与请求链路追踪，监控 /health 与数据库连通性。
4. 上传链路统一限制文件类型、大小与鉴权范围。
5. 对 AI 调用增加配额控制与失败重试策略。
6. LLM 接口密钥（DASHSCOPE_API_KEY）仅存于服务端环境变量，禁止暴露给前端。

## 开发计划

### 已完成

| 模块 | 功能 | 状态 |
|------|------|------|
| LLM 引擎 | ModelFactory 统一模型工厂（DashScope） | ✅ 已完成 |
| LLM 引擎 | 单轮对话链（useChat） | ✅ 已完成 |
| LLM 引擎 | 推理模型链（useDeepThink，DeepSeek-R1） | ✅ 已完成 |
| LLM 引擎 | 多轮 Agent 链（runAgentChain / streamAgentChain） | ✅ 已完成 |
| LLM 引擎 | 会话标题自动生成（generateConversationTitle） | ✅ 已完成 |
| LLM 引擎 | DashScope 百炼应用集成（题目分析 / AI 导题） | ✅ 已完成 |
| 用户端 | AI 智能对话页面（Mio） | ✅ 已完成 |
| 用户端 | 流式输出（SSE / Chunked / WebSocket 自适应） | ✅ 已完成 |
| 用户端 | 会话管理（创建 / 重命名 / 删除 / 收藏） | ✅ 已完成 |
| 用户端 | 会话搜索（标题 + 消息预览模糊匹配） | ✅ 已完成 |
| 用户端 | 消息分页加载 + 骨架屏 | ✅ 已完成 |
| 用户端 | 深度思考模式（思考过程 / 回答分离渲染） | ✅ 已完成 |
| 后端 | 对话持久化（会话表 + 消息表，token 统计） | ✅ 已完成 |
| 后端 | Agent 定义管理（CRUD + 发布状态） | ✅ 已完成 |
| 管理端 | Agent 管理页面 | ✅ 已完成 |

### 近期计划

| 优先级 | 模块 | 功能 | 说明 |
|--------|------|------|------|
| P0 | LLM 引擎 | Agent 工具调用（Tool Use） | 接入计算器、搜索等外部工具，支持 function calling |
| P0 | 用户端 | 对话中图片/文件发送 | 支持多模态输入，图片识别与文件解析 |
| P1 | LLM 引擎 | 对话记忆模块 | 缓冲记忆 / 摘要记忆 / 向量记忆，提升长对话连贯性 |
| P1 | LLM 引擎 | RAG 检索增强生成 | 文档加载 → 分割 → 向量化 → 检索 → 注入上下文 |
| P1 | 用户端 | AI 题目讲解 | 选中题目后调用 AI 生成详细解析与知识点关联 |
| P1 | 用户端 | AI 错因分析 | 基于错题数据生成个性化错因分析与学习建议 |
| P2 | LLM 引擎 | 多模型动态切换 | 用户端可选模型（Qwen / DeepSeek / 自定义），管理端配置模型池 |
| P2 | LLM 引擎 | 向量存储集成 | Milvus / FAISS / 内存向量库，支撑 RAG 和语义搜索 |
| P2 | 管理端 | AI 数据分析助手 | 自然语言查询学习数据，自动生成分析报告 |
| P2 | 后端 | AI 调用配额与计费 | 按用户/按模型限制 token 用量，超额降级或提示 |

### 远期规划

| 模块 | 功能 | 说明 |
|------|------|------|
| LLM 引擎 | Agent 工作流编排 | 支持多步骤 Agent 工作流（条件分支、循环、并行） |
| LLM 引擎 | 文档加载器 | PDF / Web / 数据库文档加载，支撑 RAG 知识库构建 |
| LLM 引擎 | 文本分割器 | 递归分割 / 语义分割，优化长文档检索精度 |
| 用户端 | AI 学习路径规划 | 基于学习数据自动生成个性化复习计划 |
| 用户端 | 语音对话 | 接入 ASR/TTS，支持语音交互式学习 |
| 管理端 | AI 出题助手 | 基于知识点自动生成题目，支持批量导出 |
| 后端 | 多租户支持 | 数据隔离、独立配置，支持机构级部署 |
| 运维 | 监控与可观测性 | AI 调用链路追踪、延迟监控、错误告警 |

## 贡献指南

欢迎通过 Issue / PR 参与贡献。

建议流程：

1. Fork 仓库并创建分支。
2. 在对应子项目目录完成开发与自测。
3. 提交前执行必要构建验证。
4. 提交 PR

## License

项目基于 MIT 协议开源，见 [LICENSE](LICENSE)。

## 联系方式

- 邮箱：3308837335@qq.com / qijun1900@gmail.com
- 微信：18756810208
- 问题反馈：GitHub Issue

<p align="center"><strong>如果项目对你有帮助，欢迎 Star 支持。</strong></p>
