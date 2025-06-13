const OpenAI = require("openai");

const openai = new OpenAI(
    {
        apiKey:process.env.DASHSCOPE_API_KEY, 
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);

async function postExamAIanalyse(message) {
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
    ];
    const completion = await openai.chat.completions.create({
        model: "deepseek-r1-distill-llama-70b",
        messages: messages, 
    });
    return {
        Aidata:completion.choices[0].message.content,
        modelName:completion.model
    } ;
}
async function postUserChat(messages, model) {
    // 确保消息数组包含系统提示
    if (!messages || !messages.length || messages[0].role !== 'system') {
        messages = [
            { role: "system", content: "You are a helpful assistant." },
            ...messages
        ];
    }
    const completion = await openai.chat.completions.create({
        model:model,
        messages: messages,
    });
    return {
        Aidata:completion.choices[0].message.content,
        modelName:completion.model 
    } 
}


module.exports = { postExamAIanalyse,postUserChat };
