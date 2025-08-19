const OpenAI = require("openai");

const openai = new OpenAI(
    {
        apiKey:process.env.DASHSCOPE_API_KEY, 
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);

async function postExamAIanalyse(message,model) {
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
    ];
    const completion = await openai.chat.completions.create({
        model: model,
        messages: messages,
        // 添加 enable_thinking 参数，解决BadRequestError: 400 parameter.enable_thinking must be set to false for non-streaming calls
        enable_thinking: false 
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
        model: model,
        messages: messages,
        // 添加 enable_thinking 参数，解决BadRequestError: 400 parameter.enable_thinking must be set to false for non-streaming calls
        enable_thinking: false 
    });
    return {
        Aidata:completion.choices[0].message.content,
        modelName:completion.model 
    } 
}

async function postTranslateWorld(word) {
    const messages = [
        { role: "user", content: word }  // 仅包含一个用户消息，不需要系统提示
    ];
    const completion = await openai.chat.completions.create({
        model: "qwen-mt-turbo",
        messages: messages,
        enable_thinking: false,
        translation_options: {  // 添加翻译选项
            source_lang: "auto",  // 自动检测源语言
            target_lang: "zh"     // 目标语言设为中文
        }
    });
    return {
        Aidata: completion.choices[0].message.content,
        modelName: completion.model
    };
}



module.exports = { postExamAIanalyse,postUserChat ,postTranslateWorld};