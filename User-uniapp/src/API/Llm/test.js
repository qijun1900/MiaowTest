import { http } from "../../util/http.js";


export async function chatAPI(message, model) {
    try{
        return await http({
            url: '/adminapi/llm/chat',
            method: 'POST',
            data: {message, model},
            timeout: 15000 // 设置超时时间为60秒 
        })
    }catch(error){
        console.error("chatAPI 失败", error);
        throw error;
    }
}