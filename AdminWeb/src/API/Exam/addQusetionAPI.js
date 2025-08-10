import axios from "axios";

export async function FetchAddQuestionList(category, examId) {
    // 获取要添加的题目列表
    try {
        const response = await axios.get("/adminapi/foruser/get/addQusetionList", {
            params: {  
                category,
                examId
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error during fetch add question list:", error);
        throw error; 
    }
}
export async function AddOneQuestion({_id,examId, category,QuestionTitleId}) {
    // 添加题目,将题目添加到指定的题目题型中,单个
    try {
        const response = await axios.post("/adminapi/foruser/addone/Addquestion", {
            _id,
            examId,
            category,
            QuestionTitleId
        });
        return response.data;
    } catch (error) {
        console.error("Error during add question:", error);
        throw error; 
    }
}
export async function AddManyQuestion({_ids,examId,category,QuestionTitleId}) {
    // 添加题目,将题目添加到指定的题目题型中,多个
    try {
        const response = await axios.post("/adminapi/foruser/addmany/Addquestion",{
            _ids,
            examId,
            category,
            QuestionTitleId
        });
        return response.data;
    }catch (error) {
        console.error("Error during add question:", error);
        throw error;
    }
    
}

export async function FetchCheckQuestionList(examId,QuestionTitleId) {
    // 获取已添加的题目列表
    try{
        const response = await axios.get("/adminapi/foruser/get/checkQusetionList",{
            params:{
                examId,
                QuestionTitleId
            }
        });
        return response.data;
        
    }catch (error) {
        console.error("Error during fetch check question list:", error);
        throw error; 
    }
}
export async function FetchMatchQuestionList(extractedData){
    // 获取匹配的题目列表
    try{
        const response = await axios.post("/adminapi/foruser/get/matchQusetionList",{extractedData});
        return response.data;
    }catch (error) {
        console.error("Error during fetch match question list:", error);
        throw error; 
    }   
}