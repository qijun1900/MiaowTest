# LLM 模块使用文档

## 📚 目录结构

```
llm/
├──admin端老业务使用百炼平台实现，暂时不改变： https://bailian.console.aliyun.com
├── chains/                    # Langchain链配置
│   ├── conversational/       # 对话链
│   │   └── chat.js          # 基础对话功能
│   ├── retrieval/           # RAG检索链（待实现）
│   ├── agent/               # Agent链（待实现）
│   └── custom/              # 自定义链
│    
├── agents/                   # AI Agent定义（待实现）
├── prompts/                  # 提示词模板管理
│   └── templates/
│       └── index.js         # 所有提示词模板
│
├── memory/                   # 记忆管理（待实现）
├── vectorstores/            # 向量数据库（待实现）
├── models/                   # LLM模型配置
│   └── factory.js           # 模型工厂
│
├── loaders/                  # 文档加载器（待实现）
├── splitters/               # 文本分割器（待实现）
├── utils/                    # 工具函数
│   
└── index.js                  # 统一导出
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install langchain
```

### 2. 配置环境变量

在 `.env` 文件中添加：

```env
# OpenAI 配置
DASHSCOPE_API_KEY=your_openai_api_key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL= qwen-plu
