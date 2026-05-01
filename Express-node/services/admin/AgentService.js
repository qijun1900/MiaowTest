const AgentDefinitionModel = require("../../models/AgentDefinitionModel");

const { runAgentChain } = require("../../llm/chains/agent/agentChat");

const AgentService = {
  addAgent: async (data) => {
    return await AgentDefinitionModel.create(data);
  },
  getAgentList: async ({
    page,
    size,
    agentNameSearch,
    agentKeySearch,
    isPublishFilter,
  }) => {
    const skip = (page - 1) * size;
    let query = {};
    if (agentNameSearch) {
      query.agentName = { $regex: agentNameSearch, $options: "i" };
    }
    if (agentKeySearch) {
      query.agentKey = { $regex: agentKeySearch, $options: "i" };
    }

    // fix the publish filter logic here
    if (
      isPublishFilter !== undefined &&
      isPublishFilter !== null &&
      isPublishFilter !== ""
    ) {
      query.isPublish = isPublishFilter;
    }

    const [data, total] = await Promise.all([
      AgentDefinitionModel.find(query)
        .skip(skip)
        .limit(size)
        .sort({ sort: 1, createTime: -1 }),
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
    return await AgentDefinitionModel.updateOne(
      { _id },
      { isPublish: state, editTime: Date.now() },
    );
  },
  useAgentChat: async (messages, agentKey) => {
    // 1. 获取 Agent 配置
    const agentConfig = await AgentDefinitionModel.findOne({ agentKey });

    let defaultModel = "qwen-plus"; // fallback底座模型
    let systemPrompt = "你是一个有用的AI助手。"; // fallback默认系统引导词

    if (agentConfig) {
      if (agentConfig.defaultModel) {
        defaultModel = agentConfig.defaultModel;
      }
      if (agentConfig.systemPrompt) {
        systemPrompt = agentConfig.systemPrompt;
      }
    }

    // 2. 通过构建的 LCEL Chain 注入 prompt 执行链条对话
    return await runAgentChain(messages, systemPrompt, defaultModel);
  },
  getChatAgents: async () => {
    return await AgentDefinitionModel.find({ isPublish: 1 }).sort({
      sort: 1,
      createTime: -1,
    });
  },
};

module.exports = AgentService;
