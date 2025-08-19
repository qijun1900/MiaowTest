const axios = require('axios');
const { filterLastUserMessage } = require('../../../helpers/MessageFilter');


async function AutoAddQuestion(prompt) {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const appId = '5e5c60ebaaf544229ca276a80f07bdde';//智能体应用ID

    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

    const filteredMessages = filterLastUserMessage(prompt);
    
    // 构建请求体
    const data = {
        input: {
            prompt:filteredMessages[0].content,
        },
        parameters: {},
        debug: {}
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return response.data.output.text;
        } else {
            throw new Error(`Request failed: request_id=${response.headers['request_id']}, code=${response.status}, message=${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error calling DashScope: ${error.message}`);
        throw error;
    }
}

// 仅导出函数供外部调用
module.exports = {
    AutoAddQuestion
};