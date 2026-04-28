/**
 * LLM 极简配置文件
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  // API配置 - 根据环境变量自动选择
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL  || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  
  // 默认模型
  defaultModel: process.env.DASHSCOPE_MODEL  || 'qwen-plus',
  
  // 基础参数
  temperature: 0.7,
  maxTokens: 2000,
  
  // 简单开关
  verbose: process.env.NODE_ENV === 'development',
};
