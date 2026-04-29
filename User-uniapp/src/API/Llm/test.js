import { http } from "../../util/http.js";

export async function chatAPI(message) {
  try {
    console.log("调用 chatAPI，消息内容：", message);
    return await http({
      url: "/uniappAPI/llm/agent/chat",
      method: "POST",
      data: { message },
      timeout: 15000, // 设置超时时间为60秒
    });
  } catch (error) {
    console.error("chatAPI 失败", error);
    throw error;
  }
}
