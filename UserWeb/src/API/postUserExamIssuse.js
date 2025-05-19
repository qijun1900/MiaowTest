import axios from "axios";
const postUserExamIssuse = async (examId, ExamtagId,) => {
    try {
        const res = await axios.post(`/webapi/UserExam/postUserExamIssuse/${examId}`, {ExamtagId,Type:1});
        return res.data
    }catch (error) {
        console.log(error);
    }
}
export default postUserExamIssuse;