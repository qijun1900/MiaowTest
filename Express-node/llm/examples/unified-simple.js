/**
 * 统一极简示例
 * 支持 OpenAI 和阿里云，通过环境变量切换
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { ChatOpenAI } = require('@langchain/openai');

// 从环境变量读取配置
const config = {
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL,
  model: process.env.DASHSCOPE_MODEL,
};

async function chat(message) {
  // 创建模型实例
  const model = new ChatOpenAI({
    apiKey: config.apiKey,
    modelName: config.model,
    temperature: 0.7,
    configuration: {
      baseURL: config.baseURL,
    },
  });

  // 发送消息
  const response = await model.invoke([
    ['system', '你是一个有帮助的AI助手。'],
    ['human', message]
  ]);

  return response.content;
}

// 主函数
async function main() {
  console.log('🤖 统一LLM示例');
  console.log(`📍 使用模型: ${config.model}`);
  console.log(`🔗 API地址: ${config.baseURL}\n`);

  try {
    // 示例1: 简单对话
    console.log('示例1: 简单对话');
    const response1 = await chat('你好');
    console.log(`回复: ${response1}\n`);

    // 示例2: 知识问答
    console.log('示例2: 知识问答');
    const response2 = await chat('什么是vue.js？');
    console.log(`回复: ${response2}\n`);

    // 示例3: 代码生成
    console.log('示例3: 代码生成');
    const response3 = await chat('写一个JavaScript函数，实现数组去重');
    console.log(`回复: ${response3}\n`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行
main();
