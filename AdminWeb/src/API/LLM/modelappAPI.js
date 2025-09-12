import axios from "axios";

//  批量导入题目
export async function modelappBatchaddQuestion(message, examId, category) {
    try {
        const res = await axios.post("/adminapi/modelapp/batchaddquestion", { message, examId, category })
        return res.data
    } catch (error) {
        console.error("Error:", error);
    }
}

/** 
 * 智能体获取题目解析
 * @param {*} message // 问题描述
 * @param {*} questionType // 题目类型
 * @param {*} _id // 题目_id
 * @returns {
 *    code: 200,
 *    ActionType: "OK",
 *    data: {
 *        success: true,
 *        message: '数据插入成功',
 *      } 
 * } 
 */
export async function modelappGetQuestionAnalysis({
    message,
    questionType,
    _id,
}) {
    try {
        // 添加超时设置，默认为60秒
        const res = await axios.post("/adminapi/modelapp/getquestionanalysis", 
            { message, questionType, _id },
            { timeout: 300000 } // 设置超时时间为300秒
        )
        return res.data
    } catch (error) {
        console.error("Error:", error);
        return {
            code: 500,
            message: error.message || "请求超时或服务器错误",
            data: null
        };
    }
}
