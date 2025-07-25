import axios from "axios";
 export const shortAPI = {
     //添加简答题
    postAddShort: async (data) => {
        try{
            const res = await axios.post("/adminapi/exam/add/shortquestion", data)
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
