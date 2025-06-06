import axios from "axios";
const postUserAdvice = async (data) => {
    try {
        const res = await axios.post("/webapi/user/postUserAdvice", data)
        if (res.data.code === 200) {
            return res.data;
        }
    }catch (error) {
        console.error('Error fetching exam details:', error);
        throw error;
    }
}
export default postUserAdvice
