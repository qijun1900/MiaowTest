const OpenAI = require("openai");

const openai = new OpenAI(
    {
        apiKey:process.env.DASHSCOPE_API_KEY, 
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);

async function chat(message) {
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
    ];
    const completion = await openai.chat.completions.create({
        model: "deepseek-v3",
        messages: messages, 
    });
    return completion.choices[0].message.content;
}

module.exports = { chat };

