import axios from 'axios';
const postUserQuestionIssuse = async (data) => {
    try {
        const res = await axios.post("/webapi/user/postUserQuestionIssuse", data) 
        if (res.data.code === 200) {
            return res.data; 
        }
    }catch (error) {
        console.error('Error fetching exam details:', error);
        throw error;
    }

}
export default postUserQuestionIssuse
