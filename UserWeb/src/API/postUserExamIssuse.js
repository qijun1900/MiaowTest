import axios from "axios";
const postUserExamIssuse = async (examId, tagId,) => {
    try {
        const response = await axios.post(`/webapi/UserExam/postUserExamIssuse/${examId}`, { tagId });
        return response.data;
    }catch (error) {
        console.log(error);
    }
}
export default postUserExamIssuse;