const llm = require("../index");

async function testChat() {
    console.log("正在测试基础对话功能...");
    const response = await llm.chat("你可以干嘛什么？");
    console.log("AI回复：", response);
}

testChat();