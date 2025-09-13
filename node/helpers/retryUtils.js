/**
 * 重试工具函数库
 * 用于处理可能失败的操作，特别是处理API请求频率限制（HTTP 429错误）的情况
 */

// 创建一个延迟函数，用于在重试之间添加等待时间
// 参数: ms - 延迟的毫秒数
// 返回: 一个在指定时间后resolve的Promise
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带有重试机制的异步函数包装器
 * @param {Function} fn - 要执行的异步函数
 * @param {number} maxRetries - 最大重试次数，默认为3次
 * @param {number} delay - 初始延迟时间（毫秒），默认为1000ms
 * @returns {Promise} - 返回执行结果或抛出错误
 */
const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError; // 存储最后一次错误
    
    // 循环尝试执行函数，最多尝试maxRetries次
    for (let i = 0; i < maxRetries; i++) {
        try {
            // 尝试执行传入的异步函数
            return await fn();
        } catch (error) {
            lastError = error; // 保存错误信息
            
            // 检查是否是429错误（HTTP请求频率限制）
            if (error.response && error.response.status === 429) {
                // 使用指数退避策略计算等待时间
                // 每次重试的等待时间是前一次的2倍（delay, 2*delay, 4*delay...）
                const waitTime = delay * Math.pow(2, i);
                console.log(`API请求频率限制，等待 ${waitTime}ms 后重试 (尝试 ${i + 1}/${maxRetries})`);
                
                // 等待计算出的时间后继续下一次重试
                await sleep(waitTime);
            } else {
                // 如果不是429错误，直接抛出错误，不进行重试
                throw error;
            }
        }
    }
    
    // 如果所有重试都失败了，抛出最后一个错误
    throw lastError;
};

// 导出withRetry函数供其他模块使用
module.exports = {
    withRetry
};