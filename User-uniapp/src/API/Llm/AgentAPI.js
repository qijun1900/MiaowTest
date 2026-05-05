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
 * @description: 获取用户会话列表
 * @returns  
 */
export const fetchConversationList = () => {
    try {
        return http({
            url: "/uniappAPI/llm/agent/conversations",
            method: "GET",
        });
    } catch (error) {
        console.error("fetchConversationList 失败", error);
        throw error;
    }
}

/**
 * @description: 获取会话的历史消息列表
 * @param {string} conversationId 会话ID
 * @returns  
 */
export const fetchConversationMessages = (conversationId) => {
    try {
        return http({
            url: `/uniappAPI/llm/agent/conversations/${conversationId}/messages`,
            method: "GET",
        });
    } catch (error) {
        console.error("fetchConversationMessages 失败", error);
        throw error;
    }
}

/**
 * @description: 与智能体对话
 * @param {*} data 
 * @returns  
 */
export const chatWithAgent = ({message, agentKey, conversationId}) => {
    try {
        return http({
            url: "/uniappAPI/llm/agent/chat",
            method: "POST",
            data:{
                message,
                agentKey,
                conversationId,
            }
        })
    } catch (error) {
        console.error("chatWithAgent 失败", error);
        throw error;
    }
}