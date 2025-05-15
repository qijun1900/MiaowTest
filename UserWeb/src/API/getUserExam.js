//获取用户单个考试信息
import axios from "axios";
const getUserExaminfo = async (id) => {
  try {
    const res = await axios.get(`/webapi/Exam/getUserExamInfo/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};
export default getUserExaminfo;