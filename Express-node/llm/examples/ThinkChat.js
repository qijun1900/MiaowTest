const llm = require("../index");

async function testChat() {
    console.log("正在测试基础对话功能...");
    // 2. 新用法 — 流式回调（实时看到输出）
    await llm.useDeepThink("你可以干嘛？", "deepseek-r1", {
        onReasoning: (chunk) => {
            // 实时打印思考过程（ Dustin 内容）
            process.stdout.write(chunk);
        },
        onAnswer: (chunk) => {
            // 实时打印最终回答
            process.stdout.write(chunk);
        },
        onComplete: (result) => {
            // 流结束后的完整结果
            console.log("\n\n完成！", result);
        }
    });
}

testChat();