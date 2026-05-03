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