import axios from "axios";
 export const blankAPI = {
     //添加填空题
    postAddBlank: async (data) => {
        try{
            const res = await axios.post("/adminapi/exam/add/blankquestion", data)
            if(res.data.code === 200){
                return res.data
            }else{
                return null
            }
        }catch (error) {
            console.log(error)
        }
    },
 }