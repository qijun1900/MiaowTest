const AgentDefinitionModel = require("../../models/AgentDefinitionModel");
const { runAgentChain } = require("../../llm/chains/agent/agentChat");

const LLMService = {
    ChatWithAgent: async (messages, agentKey) => {
        // 1. 获取 Agent 配置
        const agentConfig = await AgentDefinitionModel.findOne({
            agentKey, isPublish: 1
        });
        if (!agentConfig) {
            throw new Error("Agent不存在或未发布");
        }
        let defaultModel = null;
        let systemPrompt = null;
        if (agentConfig) {
            if (agentConfig.defaultModel) {
                defaultModel = agentConfig.defaultModel;
            }
            if (agentConfig.systemPrompt) {
                systemPrompt = agentConfig.systemPrompt;
            }
        }
        //run Agent Chain
        return await runAgentChain(messages, systemPrompt, defaultModel);
    },
    getChatAgents: async () => {
        return await AgentDefinitionModel.find({ isPublish: 1 }, {
            agentName: 1,
            agentKey: 1,
        }).sort({
            sort: 1,
            createTime: -1,
        });
    }
};
module.exports = LLMService;