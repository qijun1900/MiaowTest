//调用大模型获得题目解析
import axios from "axios";
const postExamAIanalyse = async (message,QuestionID) => {
    try {
        const res = await axios.post('/webapi/chat/ExamAIanalyse/psotExamAIanalyse',{message,QuestionID});
        if (res.data.code === 200) {
            return res.data; 
        }
        return null; 
    } catch (error) {
        console.error('Error fetching exam AI analysis:', error);
        throw error; 
    }
}
export default postExamAIanalyse
