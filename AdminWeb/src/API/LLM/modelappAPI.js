import axios  from "axios";

export async function modelappBatchaddQuestion(message,examId,category) {
    try {
        const res = await axios.post("/adminapi/modelapp/batchaddquestion",{message,examId,category})
        return res.data
    }catch (error) {
        console.error("Error:", error);
    }
}