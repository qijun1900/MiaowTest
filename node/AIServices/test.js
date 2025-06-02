const OpenAI = require("openai");

const openai = new OpenAI(
    {
        apiKey:"sk-3149977d78e74b2ea8b6f41d2ee16adb", 
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);

async function chat(message) {
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
    ];
    const completion = await openai.chat.completions.create({
        model: "qwen-plus",
        messages: messages, 
    });
    return completion.choices[0].message.content;
}

module.exports = { chat };

