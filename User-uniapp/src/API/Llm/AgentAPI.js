import { http } from "../../util/http";
/**
 * @description: 获取智能体列表
 * @param {*} params 
 * @returns  
 */
export const fetchAgentList = (params) => {
    try {
        return http({
            url: "/uniappAPI/llm/agent/list",
            method: "GET",
            params,
        });
    } catch (error) {
        console.error("fetchAgentList 失败", error);
        throw error;
    }
}
/**
 * @description: 与智能体对话
 * @param {*} data 
 * @returns  
 */
export const chatWithAgent = ({messages, agentKey}) => {
    try {
        return http({
            url: "/uniappAPI/llm/agent/chat",
            method: "POST",
            data:{
                messages,
                agentKey,
            }
        })
    } catch (error) {
        console.error("chatWithAgent 失败", error);
        throw error;
    }
}