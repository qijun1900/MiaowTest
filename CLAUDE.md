# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

题喵喵 (MiaowTest) — a full-stack quiz/exam practice system with AI integration. Three sub-projects in a monorepo:

| Directory | Role | Stack |
|-----------|------|-------|
| `Express-node/` | Backend API | Express + Mongoose + JWT + LangChain |
| `Admin-web/` | Admin dashboard | Vue3 + Vite + Element Plus + Pinia |
| `User-uniapp/` | User mobile app | Uni-app + Vue3 + uView Plus + Pinia |

## Common Commands

### Backend (`Express-node/`)

```bash
cd Express-node
npm run dev          # Development with hot reload (node-dev)
npm run start        # Same as dev
npm run prod         # Production mode
npm run migrate:oss  # Migrate local files to OSS
```

Before first run, copy `.env.example` → `.env` and configure `MONGO_PROVIDER`, `DASHSCOPE_API_KEY`, and database credentials.

### Admin Web (`Admin-web/`)

```bash
cd Admin-web
npm run dev          # Vite dev server (proxies /adminapi to backend)
npm run build        # Production build
npm run lint         # ESLint fix
```

### User App (`User-uniapp/`)

```bash
cd User-uniapp
npm run dev:mp-weixin   # WeChat Mini Program (primary target)
npm run dev:h5           # H5 web
npm run build:mp-weixin  # Build for WeChat
npm run lint             # ESLint fix
```

### Root scripts

```bash
npm run start:node       # Start backend
npm run start:admin      # Start admin dev server
npm run start:uniapp     # Start uniapp WeChat dev
```

## Architecture

### Backend Request Flow

```
bin/www (entry, DB connect, server start)
  → app.js (Express app: helmet, compression, rate-limit, mongo-sanitize, CORS)
    → clientDetector middleware (sets req.clientPlatform: web/miniapp/app)
    → requestTraceLogger middleware (generates X-Trace-Id)
    → User-facing routes at /uniappAPI/... (no auth wall)
    → adminAuth middleware (JWT check for all /adminapi/*)
    → Admin routes at /adminapi/...
    → WebSocket upgrade at /ws/llm/agent/chat/stream (token auth via query param)
```

### Database Initialization

Before first run, initialize the database:

```bash
cd Express-node
node script/init-database.js
```

### Route Conventions

- **User routes**: path prefix `/uniappAPI/<Module>/<action>` — defined in `routes/user/`
- **Admin routes**: path prefix `/adminapi/<module>/<action>` — defined in `routes/admin/`
- **Health check**: `GET /health` returns DB status, env, timestamp
- Admin routes are gated by `adminAuth` middleware (JWT verification with token refresh). The login route `/adminapi/user/login` is exempted.
- User routes optionally use `JWT.verifyTokenMiddleware()` or `JWT.optionalTokenMiddleware()` per-route.

### Error Handling Pattern

Admin and user controllers use **different** error handling strategies:

- **User controllers** (`controllers/user/`): Each handler wraps logic in try-catch and returns `{ success: false, error: "..." }` with appropriate HTTP status.
- **Admin controllers** (`controllers/admin/`): No try-catch — errors propagate to the global error handler in `app.js:157`, which returns `{ errCode: "-1", errInfo: err.message }`.

When adding new admin endpoints, be aware that unhandled promise rejections will be caught by the global handler, not by the controller.

### Streaming Endpoints

Three streaming transports for LLM chat:

| Transport | Endpoint | Protocol |
|-----------|----------|----------|
| SSE | `POST /uniappAPI/llm/agent/chat/stream` | `text/event-stream` |
| WebSocket | `GET /ws/llm/agent/chat/stream?token=<jwt>` | `ws://` upgrade |
| Non-streaming | `POST /uniappAPI/llm/agent/chat` | Standard JSON |

WebSocket auth uses JWT from query param (not header), validated in `ws/streamChat.js`.

### Three-Layer Backend Pattern

Each feature domain follows: **Route → Controller → Service → Model**

```
routes/admin/ExamRouter.js
  → controllers/admin/ExamController.js
    → services/admin/ExamService.js
      → models/ExamModel.js (Mongoose)
```

### Database

`db/db.enhanced.js` — `DatabaseManager` singleton with multi-provider support (local/1panel/cloud MongoDB), auto-detection for cloud runtime, graceful shutdown, health checking.

30+ Mongoose models in `models/`. Key ones:
- `ExamModel` / `UserExamModel` — exam definitions and user-specific exam state
- `SelectModel` / `BlankModel` / `JudgeModel` / `ShortModel` — question type models
- `UserModel` / `ConsumerModel` — users (admin vs consumer)
- `WrongBookModel` / `WrongQuestionModel` — wrong answer tracking
- `AgentConversationModel` / `AgentMessageModel` — AI agent chat history

### LLM / AI Infrastructure (`llm/`)

LangChain-based, configured in `config/llm.config.js` (DashScope by default, OpenAI-compatible). Entry point: `llm/index.js` exports `runAgentChain`, `streamAgentChain`, `generateConversationTitle`.

- `llm/models/factory.js` — `ModelFactory.getModel()` creates ChatOpenAI instances (reads `DASHSCOPE_API_KEY` from env, **no startup validation**)
- `llm/chains/conversational/chat.js` — single-turn chain (stateless)
- `llm/chains/conversational/deepThink.js` — reasoning model chain (DeepSeek-R1, think/answer separation)
- `llm/chains/agent/agentChat.js` — multi-turn agent chain with history, streaming, auto title generation
- `llm/chains/rag/ragChain.js` — RAG retrieval chain
- `llm/admin/ModelApp/` — DashScope Bailian app integration (question analysis / AI import)
- `llm/prompts/templates/` — prompt templates: `scenePrompts.js` (scene-specific prompts), `wordListPrompts.js`
- `llm/agents/` — reserved directory for future LangChain Agent framework (currently empty: base/, tools/, workflows/)

**Chat flow** (user-facing):
```
Request → LLMController → LLMService.ChatWithAgentAndSave()
  → ensureConversation()       — auto-create/update conversation
  → saveUserMessage()          — persist user message
  → fetchHistory()             — load last 20 messages
  → streamAgentChain()         — LangChain streaming inference
  → saveAIReply()              — persist AI reply
  → maybeGenerateTitle()       — async title generation (fire-and-forget)
```

### Admin-Web State Management

Dual store: **Pinia** (main) + **Vuex** (router state only).
- `stores/index.js` (Pinia) — `useAppStore`: userInfo, examInfo, isCollapse (persisted via pinia-plugin-persistedstate)
- `stores/vuex.js` (Vuex) — `isGetterRouter` flag for dynamic route registration

Router: `Mainbox.vue` is the layout shell. Child routes loaded dynamically from `router/config.js` on first auth. Permission check via `useAppStore().userInfo.role === 1`.

### User-uniapp HTTP Layer (`util/http.js`)

Multiple transport modes in a single `http()` function:

1. **Cloud Container mode** (`useCloudContainer=true`): Uses `wx.cloud.callContainer()` for WeChat Cloud Run
2. **Direct mode**: Standard `uni.request()` with interceptor-based auth headers

File uploads (`httpUpload`) support three modes:
1. Cloud object storage (`useCloudStorage=true`): `wx.cloud.uploadFile` → notify backend
2. Base64 relay (`useCloudStorage=false`): read file as base64 → POST via callContainer (for files < 100KB)
3. Direct: `uni.uploadFile`

All modes auto-attach `source-client` and `platform` headers, auto-add Bearer token from local storage, and handle 401 by clearing token and redirecting to My tab. Cloud container mode includes cold-start wakeup retry logic with user prompt.

### Environment Configuration

- Backend: `Express-node/.env` (template: `.env.example`) — DB provider, WeChat app credentials, DashScope API key, OSS config, email SMTP
- User app: `User-uniapp/.env.development` / `.env.production` (template: `.env.example`) — `VITE_SERVER_HOST`, `VITE_SERVER_PORT`, cloud container settings, OSS domain
- Admin web: `Admin-web/src/config/esc.config.js` — server host/port and OSS config (hardcoded defaults, no .env)

### Static Files / Uploads

Upload flow: Admin-web uploads via `/adminapi/user/upload` → `uploadHelper.js` middleware → OSS (if configured) or local `public/` directory. `ossStaticRedirect` middleware redirects static requests to OSS CDN. User-uniapp uploads go through `/uniappAPI/uploadFile/...` endpoints with dual OSS/cloud-storage paths.

## Key Patterns

- Admin API responses follow `{ errCode, errInfo, data }` shape (some admin controllers also use `{ code, ActionType, data }`)
- User API responses follow `{ success, data, error }` shape (LLMController) or `{ code, message, data }` shape (other user controllers)
- JWT tokens: short-lived, refreshed on each admin request (returned in `Authorization` response header)
- The admin frontend's axios response interceptor persists refreshed tokens from response headers
- Mongoose models use collection names prefixed by domain (e.g., exams, users, agent_conversations)
- No test infrastructure is set up in the project currently