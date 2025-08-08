import axios from "axios";


export async function getQuestionList(params) {
    //获取题目列表
    try {
        const res = await axios.get("/adminapi/exam/get/questionList", {
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
}

export async function UpdateOneQuestion(data) {
    //更新一条题目状态
    try {
        const response = await axios.post("/adminapi/exam/update/PublishQuestionstate", data);
        return response.data
    } catch (error) {
        console.error("Error during update exam status:", error);
    }
}
export async function UpdateManyQuestion(data, questionType) {
    //更新多条题目状态
    try {
        const Ids = data.map(ids => ids._id)
        const response = await axios.post("/adminapi/exam/update/ManyPublishQuestionstate", { Ids, questionType });
        return response.data
    } catch (error) {
        console.error("Error during update exam status:", error);
    }

}
export async function DeleteOneQuestion(_id, questionType) {
    //删除一条题目
    try {
        const response = await axios.post("/adminapi/exam/question/deleteOneQuestion", { _id, questionType });
        return response.data

    } catch (error) {
        console.error("Error during update exam status:", error);
    }
}
export async function DeleteManyQuestion(data, questionType) {
    //删除多条题目
    try {
        const Ids = data.map(ids => ids._id)
        const response = await axios.post("/adminapi/exam/question/deleteManyQuestion", { Ids, questionType });
        return response.data

    } catch (error) {
        console.error("Error during update exam status:", error);
    }

}