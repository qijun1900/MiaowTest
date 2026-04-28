import { http } from "../../util/http.js";

export async function chatAPI(message) {
  try {
    return await http({
      url: "/uniappAPI/llm/chat",
      method: "POST",
      data: { message },
      timeout: 15000, // 设置超时时间为60秒
    });
  } catch (error) {
    console.error("chatAPI 失败", error);
    throw error;
  }
}
