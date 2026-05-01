const AgentDefinitionModel = require("../../models/AgentDefinitionModel");
const chat = require("../../llm/admin/Chat/chat");

const AgentService = {
  addAgent: async (data) => {
    return await AgentDefinitionModel.create(data);
  },
  getAgentList: async ({ page, size, agentNameSearch, agentKeySearch, isPublishFilter }) => {
    const skip = (page - 1) * size;
    let query = {};
    if (agentNameSearch) {
      query.agentName = { $regex: agentNameSearch, $options: "i" };
    }
    if (agentKeySearch) {
      query.agentKey = { $regex: agentKeySearch, $options: "i" };
    }
    
    // fix the publish filter logic here
    if (isPublishFilter !== undefined && isPublishFilter !== null && isPublishFilter !== '') {
      query.isPublish = isPublishFilter;
    }

    const [data, total] = await Promise.all([
      AgentDefinitionModel.find(query).skip(skip).limit(size).sort({ sort: 1, createTime: -1 }),
      AgentDefinitionModel.countDocuments(query),
    ]);
    return { data, total };
  },
  updateAgent: async (data) => {
    const { _id, ...updateData } = data;
    updateData.editTime = Date.now();
    return await AgentDefinitionModel.updateOne({ _id }, updateData);
  },
  deleteOneAgent: async ({ _id }) => {
    return await AgentDefinitionModel.deleteOne({ _id });
  },
  deleteManyAgent: async ({ _ids }) => {
    return await AgentDefinitionModel.deleteMany({ _id: { $in: _ids } });
  },
  changeStatus: async ({ _id, state }) => {
    return await AgentDefinitionModel.updateOne({ _id }, { isPublish: state, editTime: Date.now() });
  },
  useAgentChat: async (messages, agentKey) => {
    // 1. 获取 Agent 配置
    const agentConfig = await AgentDefinitionModel.findOne({ agentKey });
    
    let defaultModel = "qwen-plus"; // fallback
    if (agentConfig) {
      if (agentConfig.defaultModel) {
        defaultModel = agentConfig.defaultModel;
      }
      
      // 2. 如果存在 systemPrompt，将其作为 system 角色插入
      if (agentConfig.systemPrompt) {
        // 先检查 messages 里是否已经有 system prompt
        const hasSystem = messages.some(m => m.role === 'system' || m.role === 'AI助手'); // simple check
        if (!hasSystem) {
          messages.unshift({ role: "system", content: agentConfig.systemPrompt });
        }
      }
    }

    // 3. 调用底层大模型聊天
    return await chat.postUserSingleChat(messages, defaultModel);
  },
  getChatAgents: async () => {
    return await AgentDefinitionModel.find({ isPublish: 1 }).sort({ sort: 1, createTime: -1 });
  },
};

module.exports = AgentService;