import axios  from "axios";
const getLLMList = async () => {
    try {
        const res = await axios.get("/webapi/llm/getChooseLLMList")
        if (res.data.code === 200) {
            return res.data
        }
    }catch (error) {
        console.error('Error fetching exam details:', error);
        throw error;
    }
}
export default getLLMList
