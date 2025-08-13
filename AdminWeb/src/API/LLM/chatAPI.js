import axios  from "axios";

export async function testChatAPI(message,model) {
    try {
        const res = await axios.post("/adminapi/caht/test",{message,model} )
        return res.data
    }catch (error) {
        console.error("Error:", error);
    }
}

