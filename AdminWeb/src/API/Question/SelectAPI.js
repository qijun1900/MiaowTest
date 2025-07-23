// 选择题Api
import axios from "axios"
export const selectAPI = {
    //添加选择题
    postAddSelect: async (data) => {
        try {
            const res = await axios.post("/adminapi/exam/add/selectquestion", data)
            if (res.data.code == 200) {
                return res.data
            } else {
                return null
            }
        } catch (error) {
            console.log(error)
        }
    },
    //获取选择题列表
    getSelectList: async (params) => {
        try {
            const res = await axios.get("/adminapi/exam/get/selectquestion", {
                params: {
                    page: params?.page || 1,
                    size: params?.size || 20,
                    // 保留其他可能的查询参数
                    ...params
                }
            })
            if (res.data.code === 200) {
                return res.data;
            }
            return null;
        } catch (error) {
            console.log(error)
        }
    },
    postUpdateSelect: async (data,_id) => {
        //更新考试信息
        try {
            const response = await axios.post("/adminapi/exam/update/selectquestion", data,{params:{_id}});
            return response.data;
        }catch (error) {
            console.error("Error during update exam:", error);
        }
    }
}

export default selectAPI