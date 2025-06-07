# MiaoTest 项目详细介绍

## 一、项目概述

**MiaoTest** 是一个基于 Vue.js 前后端分离的智能考试与题库管理系统，支持在线考试、题库管理、用户管理、公告管理等功能。系统基于大语言模型 API集成了大模型（AI）能力， 能为试题智能生成解析与答案，提升考试与练习的智能化水平。前端分为**用户端**（UserWeb）和**后台管理端**（admin）两套系统，均基于 Vue 3 框架开发，提升开发效率和用户体验。两端通过 RESTful API 与 Node.js/Express 后端通信，实现各自的业务需求。后端基于 Node.js + Express + MongoDB，实现了 API 服务、权限认证、AI 调用等关键功能。

---

## 二、核心功能

### 1. 在线考试与练习
- 支持多种题型（单选、填空、判断、简答）。
- 用户可参加考试、查看解析、练习错题。
- 自动记录用户考试信息和成绩。

### 2. 题库管理
- 支持后台题目增删改查，题型灵活扩展。
- 每道题可存储 AI 解析、是否 AI 回答等标志。
- 支持题目批量导入与发布状态管理。

### 3. 用户与权限管理
- 用户登录注册，采用 JWT 鉴权。
- 管理员与普通用户权限区分。

### 4. 公告与资讯
- 后台支持公告栏、新闻资讯的增删改查与文件上传，前端展示轮播图与公告。

### 5. AI 题目解析与大模型能力
- 对于题目（尤其主观题），可一键请求大模型 API 生成解析与答案。
- 已有解析会缓存数据库，减少重复消耗。

---

## 三、技术架构
### 1. 前端

- **框架**：Vue3
- **UI 组件库**：Element Plus
- **状态管理**：Vuex
- **路由管理**：Vue Router
- **HTTP 通信**：Axios（含请求/响应拦截器，自动附加 token，处理 401 跳转登录）
- **进度条**：NProgress
- **文件结构**：
  - `UserWeb/`：用户端
  - `admin/`：后台管理端



### 2. 后端

- **Web 框架**：Node.js + Express
- **数据库**：MongoDB（Mongoose ODM）
- **API 分层**：
  - `controllers/`：路由控制器，处理请求分发
  - `services/`：业务逻辑层
  - `models/`：数据模型（题目、用户、新闻、AI 解析等）
  - `routes/`：API 路由，分前台 `/webapi` 和后台 `/adminapi`
- **认证授权**：
  - JWT（JSON Web Token），支持过期自动续签
  - 请求头自动附加 Authorization
- **AI 能力**：
  - 服务端负责统一调用大模型推理 API
  - 支持题目 AI 解析的缓存与落库

---

## 四、主流技术点

- **Vue3 + Element Plus**：构建现代响应式前端，提升开发效率与用户体验。
- **Axios 拦截器**：自动管理 token，异常统一处理。
- **Express + Mongoose**：快速搭建 RESTful API，数据模型灵活扩展。
- **MongoDB**：高效文档数据库，适合题库、考试、用户等数据存储。
- **JWT 认证**：前后端分离下安全可靠的用户身份验证。
- **Multer**：支持后台文件（如试题、公告）上传。
- **AI 调用**：通过 HTTP 请求对接大模型 API，智能生成题目解析。

---

## 五、AI大模型 API 调用流程详解

### 1. 前端请求

用户在前端答题页面请求题目解析时，通过调用如下接口：

```javascript
// UserWeb/src/API/postExamAIanalyse.js
import axios from "axios";
const postExamAIanalyse = async (message, QuestionID, Type) => {
    return await axios.post('/webapi/chat/ExamAIanalyse/psotExamAIanalyse', { message, QuestionID, Type });
};
```

### 2. 路由与控制器

请求路由到后端：

- 路由注册：`node/routes/web/ExamRouter.js`
  ```js
  ExamRouter.post("/webapi/chat/ExamAIanalyse/psotExamAIanalyse", ExamController.sendExamAIanalyse)
  ```
- 控制器处理：`node/controllers/web/ExamController.js`
  ```js
  sendExamAIanalyse: async (req, res) => {
      const { message, QuestionID, Type } = req.body;
      const result = await ExamService.sendExamAIanalyse(message, QuestionID, Type);
      res.send({ code: 200, ActionType: "OK", data: result });
  }
  ```

### 3. 服务层逻辑

`node/services/web/ExamService.js` 负责业务逻辑：

- 首先在数据库（AianalysisModel）查找该题的 AI 解析，若已存在直接返回，避免重复调用大模型。
- 若不存在，则调用大模型 API（如 OpenAI/自研大模型），获取解析结果。
- 解析结果保存入库供后续复用，并返回前端。

```js
sendExamAIanalyse: async (message, questionId, Type) => { 
    const existingAnalysis = await AianalysisModel.findOne({ questionId });
    if (existingAnalysis) {
        return { Aidata: existingAnalysis.analysecontent, modelName: existingAnalysis.modelName };
    }
    // 没有缓存，调用大模型API
    const result = await chat.postExamAIanalyse(message);
    await AianalysisModel.create({
        questionId,
        questionType: Type,
        questionContent: message,
        analysecontent: result.data, // 假定返回结构
        modelName: result.modelName,
        createdTime: new Date()
    });
    return { Aidata: result.data, modelName: result.modelName };
}
```
- AianalysisModel 数据结构见 `node/models/AianalysisModel.js`，包含题目ID、类型、内容、AI解析、模型名等字段。

### 4. 大模型 API 对接

`chat.postExamAIanalyse(message)` 封装了对大模型推理 API 的调用，通过 HTTP POST 请求，将题干 message 发送给大模型并获取解析。

---

## 六、总结

MiaoTest 项目以现代前后端分离架构，实现了题库、考试、资讯、公告、AI智能解析等丰富功能，采用主流技术栈（Vue3、Node.js、MongoDB、JWT、AI API 等），并通过服务端集成大模型能力赋能教育应用场景，为用户带来智能化的考试与学习体验。

---
