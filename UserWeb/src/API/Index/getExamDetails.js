import axios from "axios";
const getExamDetails = async () => {
    try {
        const res = await axios.get("/webapi/Exam/getExamList")
        if (res.data.code === 200) {
            return res.data.data; // 改为返回数据而不是console.log
        }
        return null; // 如果code不是200，返回null
    } catch (error) {
        console.error('Error fetching exam details:', error);
        throw error; // 可以选择抛出错误让调用者处理
    }
}
export default getExamDetails
