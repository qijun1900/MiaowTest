const OpenAI = require("openai");

const openai = new OpenAI(
    {
        apiKey:process.env.DASHSCOPE_API_KEY, 
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);

async function postUserSingleChat(messages, model) {
    // 过滤消息，只保留最后一个用户问题
    const filteredMessages = (messages || [])
        .filter(msg => !msg.isLoading)  //移除所有带有isLoading的消息
        .filter(msg => msg.role === 'user')  //只保留用户消息
        .slice(-1)  // 只保留最后一条用户消息
        .map(msg => ({    // 只保留API需要的字段
            role: msg.role,
            content: msg.content
        }));
    console.log('Filtered messages:', filteredMessages);
    const completion = await openai.chat.completions.create({
        model: model,
        messages: filteredMessages,
        // 添加 enable_thinking 参数
        enable_thinking: false 
    });
    return {
        Aidata:completion.choices[0].message.content,
        modelName:completion.model 
    } 
}


module.exports = { postUserSingleChat};
