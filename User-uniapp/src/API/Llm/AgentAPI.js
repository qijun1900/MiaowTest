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
 * @param {object} params - 可选查询参数，如 { favorites: 1 }
 * @returns
 */
export const fetchConversationList = (params) => {
    try {
        return http({
            url: "/uniappAPI/llm/agent/conversations",
            method: "GET",
            params,
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

/**
 * @description: 重命名会话标题
 * @param {string} conversationId 会话ID
 * @param {string} title 新标题
 * @returns
 */
export const renameConversation = (conversationId, title) => {
    try {
        return http({
            url: `/uniappAPI/llm/agent/conversations/${conversationId}/rename`,
            method: "PUT",
            data: { title },
        });
    } catch (error) {
        console.error("renameConversation 失败", error);
        throw error;
    }
}

/**
 * @description: 删除会话（软删除）
 * @param {string} conversationId 会话ID
 * @returns
 */
export const deleteConversation = (conversationId) => {
    try {
        return http({
            url: `/uniappAPI/llm/agent/conversations/${conversationId}`,
            method: "DELETE",
        });
    } catch (error) {
        console.error("deleteConversation 失败", error);
        throw error;
    }
}

/**
 * @description: 收藏/取消收藏会话
 * @param {string} conversationId 会话ID
 * @returns
 */
export const toggleFavoriteConversation = (conversationId) => {
    try {
        return http({
            url: `/uniappAPI/llm/agent/conversations/${conversationId}/favorite`,
            method: "PUT",
        });
    } catch (error) {
        console.error("toggleFavoriteConversation 失败", error);
        throw error;
    }
}