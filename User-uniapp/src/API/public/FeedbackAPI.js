import { http } from '../../util/http.js';

/**
 * 提交用户反馈
 * @param {Object} feedbackData - 反馈数据对象
 * @param {number} feedbackData.type - 反馈类型 (1-系统反馈 2-题目反馈 3-功能建议 4-其他)
 * @param {string} feedbackData.content - 反馈内容，必填
 * @param {string} feedbackData.contactInfo - 联系方式，可选
 * @param {string} feedbackData.relatedId - 关联ID（如题目ID、考试ID等），可选
 * @returns {Promise} 返回提交反馈的响应
 */
export const submitFeedbackAPI = async(feedbackData) => {
   try{
       return await http({
           url: '/uniappAPI/Feedback/submitFeedback',
           method: 'POST',
           data: feedbackData,
       });
   }catch(error){
       console.error("submitFeedback 失败", error);
       throw error;
   }
}
