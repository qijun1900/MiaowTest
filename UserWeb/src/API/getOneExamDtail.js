// 发送请求获取单个考试详情
import axios from "axios";
const getOneExamDtail = async (id) => {
  try {
    const res= await axios.get(`/webapi/Exam/getOneExam/${id}`); 
   if (res.data.code === 200) {
      return res.data.data;
    }else{
      return null;
    } 
   }catch(error){
    console.log(error)
    }
}
export default getOneExamDtail;