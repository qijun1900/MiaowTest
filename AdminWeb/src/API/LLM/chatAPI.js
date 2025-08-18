import axios  from "axios";

export async function testChatAPI(message,model) {
    try {
        const res = await axios.post("/adminapi/llm/chat",{message,model} )
        return res.data
    }catch (error) {
        console.error("Error:", error);
    }
}

export async function getChatModels() {
    try {
        const res = await axios.get("/adminapi/llm/get/getChatModelsList")
        return res.data;
    }catch (error) {
        console.error("Error:", error);
    }
}
