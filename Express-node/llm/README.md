# LLM 模块使用文档

## 📚 目录结构

```
llm/
├──Admin端老业务使用百炼平台实现，暂时不改变： https://bailian.console.aliyun.com
├── chains/                    # Langchain链配置
│   ├── conversational/       # 对话链
│   │   └── chat.js          # 基础对话功能
│   ├── retrieval/           # RAG检索链（待实现）
│   ├── agent/               # Agent链（待实现）
│   └── custom/              # 自定义链
│       ├
│      
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
│   
│
└── index.js                  # 统一导出
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install langchain @langchain/openai @langchain/core tiktoken
```

### 2. 配置环境变量

在 `.env` 文件中添加：

```env
# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 向量数据库配置（可选）
VECTOR_STORE_TYPE=chroma
CHROMA_URL=http://localhost:8000

# 日志级别
LOG_LEVEL=info
NODE_ENV=development
```

### 3. 基础使用

```javascript
const llm = require('./llm');

// 简单对话
const response = await llm.chat('你好，请介绍一下自己', 'gpt-4');
console.log(response);

// 生成题目
const question = await llm.generateQuestion(
  '请生成一道关于JavaScript闭包的选择题',
  1,  // 题目类型：1=选择题
  'gpt-4'
);
console.log(question);

// 分析题目
const analysis = await llm.analyzeQuestion({
  question: '什么是闭包？',
  answer: '闭包是指有权访问另一个函数作用域中变量的函数'
}, 'gpt-4');
console.log(analysis);
```

## 📖 API 文档

### 对话功能

#### chat(message, modelName)
发送单条消息，无上下文记忆。

```javascript
const response = await llm.chat('解释一下什么是Promise', 'gpt-4');
```

#### chatWithContext(userId, message, modelName)
发送带上下文记忆的消息。

```javascript
const response = await llm.chatWithContext(
  'user123',
  '继续上一个话题',
  'gpt-4'
);
```

#### streamChat(message, modelName, onToken)
流式对话，实时返回token。

```javascript
await llm.streamChat('写一首诗', 'gpt-4', (token) => {
  process.stdout.write(token);
});
```

### 题目生成功能

#### generateQuestion(prompt, questionType, modelName)
生成单个题目。

参数：
- `prompt`: 题目要求
- `questionType`: 题目类型（1=选择题, 2=填空题, 3=判断题, 4=简答题）
- `modelName`: 模型名称

```javascript
const result = await llm.generateQuestion(
  '生成一道关于数组方法的选择题',
  1,
  'gpt-4'
);
```

#### generateBatchQuestions(prompt, count, questionType, modelName)
批量生成题目。

```javascript
const result = await llm.generateBatchQuestions(
  '生成关于React Hooks的题目',
  5,  // 生成5道题
  1,
  'gpt-4'
);
```

#### generateByKnowledgePoint(knowledgePoint, difficulty, questionType, modelName)
根据知识点生成题目。

```javascript
const result = await llm.generateByKnowledgePoint(
  'JavaScript异步编程',
  '中等',
  1,
  'gpt-4'
);
```

### 题目分析功能

#### analyzeQuestion(questionInfo, modelName)
分析题目，生成详细解析。

```javascript
const result = await llm.analyzeQuestion({
  question: '以下哪个不是JavaScript的数据类型？',
  options: ['A. String', 'B. Number', 'C. Character', 'D. Boolean'],
  answer: 'C'
}, 'gpt-4');
```

#### generateSolutionSteps(questionInfo, modelName)
生成解题步骤。

```javascript
const result = await llm.generateSolutionSteps({
  question: '计算 2 + 3 * 4 的结果',
  answer: '14'
}, 'gpt-4');
```

#### identifyCommonMistakes(questionInfo, modelName)
识别题目的易错点。

```javascript
const result = await llm.identifyCommonMistakes({
  question: 'var、let、const的区别是什么？',
  answer: '...'
}, 'gpt-4');
```

### 工具方法

#### countTokens(text, modelName)
计算文本的token数量。

```javascript
const tokens = llm.countTokens('Hello, world!', 'gpt-4');
console.log(`Token count: ${tokens}`);
```

#### estimateCost(inputTokens, outputTokens, modelName)
估算API调用成本。

```javascript
const cost = llm.estimateCost(1000, 500, 'gpt-4');
console.log(`Total cost: $${cost.totalCost}`);
```

#### getModelInfo(modelName)
获取模型信息。

```javascript
const info = llm.getModelInfo('gpt-4');
console.log(info);
// {
//   provider: 'openai',
//   contextWindow: 8192,
//   maxOutputTokens: 4096,
//   costPer1kTokens: { input: 0.03, output: 0.06 }
// }
```

## 🔧 配置说明

### 模型配置

在 `config/llm.config.js` 中配置：

```javascript
models: {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    defaultModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  }
}
```

### 提示词配置

在 `llm/prompts/templates/index.js` 中自定义提示词模板。

### 验证配置

输入验证规则在 `llm/utils/validator.js` 中配置。

## 🎯 最佳实践

### 1. 错误处理

```javascript
try {
  const response = await llm.chat(message, 'gpt-4');
  console.log(response);
} catch (error) {
  if (error.message.includes('输入验证失败')) {
    // 处理验证错误
  } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
    // 处理频率限制
  } else {
    // 处理其他错误
  }
}
```

### 2. Token管理

```javascript
// 检查token数量
const tokens = llm.countTokens(message, 'gpt-4');
if (tokens > 4000) {
  console.warn('消息过长，可能会被截断');
}

// 估算成本
const cost = llm.estimateCost(tokens, 500, 'gpt-4');
console.log(`预估成本: $${cost.totalCost}`);
```

### 3. 批量处理

```javascript
// 批量生成题目时添加延迟
const questions = [];
for (let i = 0; i < 10; i++) {
  const result = await llm.generateQuestion(prompt, 1, 'gpt-4');
  questions.push(result);
  
  // 避免频率限制
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### 4. 上下文管理

```javascript
// 为每个用户维护独立的对话上下文
const userId = 'user123';
const response1 = await llm.chatWithContext(userId, '你好', 'gpt-4');
const response2 = await llm.chatWithContext(userId, '继续', 'gpt-4');

// 清除上下文
llm.chatChain.clearHistory(userId, 'gpt-4');
```

## 🔍 调试

### 启用详细日志

在 `config/llm.config.js` 中设置：

```javascript
logging: {
  enabled: true,
  level: 'debug',
  logRequests: true,
  logResponses: true
}
```

### 查看Token使用情况

```javascript
const message = '你的消息';
const tokens = llm.countTokens(message, 'gpt-4');
console.log(`输入tokens: ${tokens}`);

const response = await llm.chat(message, 'gpt-4');
const outputTokens = llm.countTokens(response, 'gpt-4');
console.log(`输出tokens: ${outputTokens}`);
console.log(`总计tokens: ${tokens + outputTokens}`);
```

## 📝 待实现功能

- [ ] RAG检索增强生成
- [ ] Agent工具系统
- [ ] 向量数据库集成
- [ ] 文档加载器
- [ ] 记忆管理系统
- [ ] 流式响应优化
- [ ] 缓存机制
- [ ] 更多模型支持（Claude, Gemini等）

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT
