/**
 * Agent 对话 API 模块。
 * 职责：声明所有 Agent 相关的 HTTP/WebSocket 接口，不含业务逻辑。
 *
 * 依赖：
 *   - util/platform.js      — 平台检测、URL 构建、请求头构建
 *   - util/sseParser.js     — SSE 文本帧解析
 *   - util/streamTransport.js — 跨平台流式传输层
 *   - util/http.js          — uni-app 统一 HTTP 封装
 */

import { http } from "../../util/http";
import { streamRequest } from "../../util/streamTransport";

// ─── 普通 API ────────────────────────────────────────────────────────────────

/** 获取已发布 Agent 列表 */
export const fetchAgentList = (params) =>
    http({ url: "/uniappAPI/llm/agent/list", method: "GET", params });

/** 获取用户会话列表，params 可传 { favorites: 1 } 筛选收藏 */
export const fetchConversationList = (params) =>
    http({ url: "/uniappAPI/llm/agent/conversations", method: "GET", params });

/** 搜索会话（按标题和消息预览模糊匹配） */
export const searchConversations = (keyword) =>
    http({ url: "/uniappAPI/llm/agent/conversations", method: "GET", params: { keyword } });

/** 获取指定会话的历史消息 */
export const fetchConversationMessages = (conversationId) =>
    http({ url: `/uniappAPI/llm/agent/conversations/${conversationId}/messages`, method: "GET" });

/** 非流式对话 */
export const chatWithAgent = ({ message, agentKey, conversationId }) =>
    http({ url: "/uniappAPI/llm/agent/chat", method: "POST", data: { message, agentKey, conversationId } });

/** 重命名会话标题 */
export const renameConversation = (conversationId, title) =>
    http({ url: `/uniappAPI/llm/agent/conversations/${conversationId}/rename`, method: "PUT", data: { title } });

/** 软删除会话 */
export const deleteConversation = (conversationId) =>
    http({ url: `/uniappAPI/llm/agent/conversations/${conversationId}`, method: "DELETE" });

/** 切换会话收藏状态 */
export const toggleFavoriteConversation = (conversationId) =>
    http({ url: `/uniappAPI/llm/agent/conversations/${conversationId}/favorite`, method: "PUT" });

// ─── 流式对话 ────────────────────────────────────────────────────────────────

/**
 * 流式对话接口。
 * 底层根据运行平台自动选择传输方式（H5 SSE / 小程序 chunked / APP WebSocket），
 * 调用方只需传入标准回调即可接收流式数据。
 *
 * @param {Object} params
 * @param {string} params.message        - 用户消息
 * @param {string} params.agentKey       - Agent 标识
 * @param {string} params.conversationId - 会话 ID（新建时传 null）
 * @param {Function} params.onStart      - 流开始，收到 conversationId
 * @param {Function} params.onMessage    - 收到 token 片段
 * @param {Function} params.onDone       - 流完成
 * @param {Function} params.onError      - 发生错误
 * @returns {Promise<void>}
 */
export const chatWithAgentStream = ({ 
    message, 
    agentKey, 
    conversationId, 
    onStart, 
    onMessage, 
    onDone, 
    onError 
}) => {
    return streamRequest({
        url: "/uniappAPI/llm/agent/chat/stream",
        data: { message, agentKey, conversationId },
        callbacks: { onStart, onMessage, onDone, onError },
    });
};
