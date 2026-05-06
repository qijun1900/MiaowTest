const AgentDefinitionModel = require("../../models/AgentDefinitionModel");
const AgentConversationModel = require("../../models/AgentConversationModel");
const AgentMessageModel = require("../../models/AgentMessageModel");
const { runAgentChain, generateConversationTitle } = require("../../llm/chains/agent/agentChat");

const LLMService = {
    ChatWithAgentAndSave: async ({uid, message: userMessage, agentKey, conversationId}) => {
        // 1. 获取 Agent 配置
        const agentConfig = await AgentDefinitionModel.findOne({ agentKey, isPublish: 1 });
        if (!agentConfig) throw new Error("Agent不存在或未发布");

        // 2. 会话管理 (无则创建，有则更新)
        let convId = conversationId;
        let sequence = 0;
        if (!convId) {
            let title = userMessage.substring(0, 20);
            try {
                const aiTitle = await generateConversationTitle(userMessage, agentConfig.defaultModel);
                if (aiTitle) title = aiTitle;
            } catch (e) {
                // AI 标题生成失败时降级为字符串截断，不影响主流程
            }
            const newConv = new AgentConversationModel({
                Uid: uid,
                agentKey,
                title,
                lastMessagePreview: userMessage.substring(0, 50),
                messageCount: 0,
                scene: agentConfig.agentKey || "default",
                currentModel: agentConfig.defaultModel || "",
            });
            await newConv.save();
            convId = newConv._id;
        } else {
            await AgentConversationModel.updateOne(
                { _id: convId },
                { $set: 
                    { 
                        lastMessagePreview: userMessage.substring(0, 50), 
                        lastMessageAt: new Date(), 
                        currentModel: agentConfig.defaultModel || "" 
                    } 
                }
            );
            const lastMsg = await AgentMessageModel.findOne({ conversationId: convId }).sort({ sequence: -1 });
            sequence = lastMsg ? lastMsg.sequence + 1 : 0;
        }

        // 3. 落库用户消息
        await AgentMessageModel.create({
            conversationId: convId,
            Uid: uid,
            agentKey,
            sequence: sequence++,
            role: "user",
            content: userMessage,
            modelName: agentConfig.defaultModel || "default"
        });

        // 4. 获取历史消息列表(为了注入上下文)
        const historyDocs = await AgentMessageModel.find({ conversationId: convId }).sort({ sequence: 1 });
        const messages = historyDocs.map(doc => ({ role: doc.role, content: doc.content }));

        // 5. 将上下文投递给大模型 
        const aiResponseContent = await runAgentChain(
            messages, 
            agentConfig.systemPrompt, 
            agentConfig.defaultModel
        );
        
        // 解析返回结果，如果是个对象则取出 reply
        const replyText = typeof aiResponseContent === 'object' && aiResponseContent !== null 
                            ? (aiResponseContent.reply || JSON.stringify(aiResponseContent)) 
                            : aiResponseContent;

        // 6. 落库 AI 消息
        await AgentMessageModel.create({
            conversationId: convId,
            Uid: uid,
            agentKey,
            sequence: sequence,
            role: "assistant",
            content: replyText,
            modelName: typeof aiResponseContent === 'object' && aiResponseContent?.modelName 
                        ? aiResponseContent.modelName 
                        : (agentConfig.defaultModel || "default")
        });
        
        // 7. 更新会话统计
        await AgentConversationModel.updateOne(
            { _id: convId },
            { $inc: { messageCount: 2 } }
        );

        // 8. 返回最新回复和绑定的会话ID
        return {
            conversationId: convId,
            data: aiResponseContent
        };
    },
    getChatAgents: async () => {
        return await AgentDefinitionModel.find({ isPublish: 1 }, {
            agentName: 1,
            agentKey: 1,
        }).sort({
            sort: 1,
            createTime: -1,
        });
    },
    getConversationList: async (uid) => {
        return await AgentConversationModel.find({ Uid: uid, status: 1 })
            .sort({ lastMessageAt: -1 })
            .select("title lastMessagePreview lastMessageAt agentKey messageCount createTime _id");
    },
    getMessageList: async (uid, conversationId) => {
        const conv = await AgentConversationModel.findOne({ _id: conversationId, Uid: uid, status: 1 });
        if (!conv) {
            throw new Error("会话不存在或无权限");
        }
        return await AgentMessageModel.find({ conversationId })
            .sort({ sequence: 1 })
            .select("role content contentType createTime");
    }
};
module.exports = LLMService;