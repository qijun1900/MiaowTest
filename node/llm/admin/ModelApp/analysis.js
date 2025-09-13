const axios = require('axios');


async function AutoAnalysisQuestion(prompt) {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const appId = 'd960bc87aa7149b6821f50413ad4859a';

    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;
    
    
    const data = {
        input: {
            prompt: prompt,
        },
        parameters: {},
        debug: {}
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 设置超时时间为30秒
        });

        if (response.status === 200) {
            return response.data.output.text;
        } else {
            throw new Error(`Request failed: request_id=${response.headers['request_id']}, code=${response.status}, message=${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error calling DashScope: ${error.message}`);
        

        if (error.response && error.response.status === 429) {
            console.error('API rate limit exceeded. Please check your usage limits.');
            error.message = 'API rate limit exceeded. Please check your usage limits.';
        }
        
        throw error;
    }
}


module.exports = {
    AutoAnalysisQuestion
};