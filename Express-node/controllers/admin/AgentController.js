const AgentService = require("../../services/admin/AgentService");

const AgentController = {
  addAgent: async (req, res) => {
    const {
      agentName,
      agentKey,
      agentType,
      description,
      defaultModel,
      systemPrompt,
      capabilities,
      isPublish,
      sort,
      config,
      creator,
    } = req.body;
    await AgentService.addAgent({
      agentName,
      agentKey,
      agentType,
      description,
      defaultModel,
      systemPrompt,
      capabilities,
      isPublish,
      sort,
      config,
      creator,
    });
    res.status(200).send({
      code: 200,
      ActionType: "OK",
    });
  },
  getAgentList: async (req, res) => {
    const { page, size, agentNameSearch, agentKeySearch, isPublishFilter } =
      req.query;
    const result = await AgentService.getAgentList({
      page: Number(page),
      size: Number(size),
      agentNameSearch,
      agentKeySearch,
      isPublishFilter: isPublishFilter ? Number(isPublishFilter) : undefined,
    });
    res.status(200).send({
      code: 200,
      ActionType: "OK",
      data: result,
    });
  },
  updateAgent: async (req, res) => {
    const {
      _id,
      agentName,
      agentKey,
      agentType,
      description,
      defaultModel,
      systemPrompt,
      capabilities,
      isPublish,
      sort,
      config,
      creator,
    } = req.body;
    await AgentService.updateAgent({
      _id,
      agentName,
      agentKey,
      agentType,
      description,
      defaultModel,
      systemPrompt,
      capabilities,
      isPublish,
      sort,
      config,
      creator,
    });
    res.status(200).send({
      code: 200,
      ActionType: "OK",
    });
  },
  deleteOneAgent: async (req, res) => {
    const { _id } = req.body;
    await AgentService.deleteOneAgent({ _id });
    res.status(200).send({
      code: 200,
      ActionType: "OK",
    });
  },
  deleteManyAgent: async (req, res) => {
    const { _ids } = req.body;
    await AgentService.deleteManyAgent({ _ids });
    res.status(200).send({
      code: 200,
      ActionType: "OK",
    });
  },
  changeStatus: async (req, res) => {
    const { _id, state } = req.body;
    await AgentService.changeStatus({ _id, state });
    res.status(200).send({
      code: 200,
      ActionType: "OK",
    });
  },
  useAgentChat: async (req, res) => {
    const { message, agentKey } = req.body;
    const result = await AgentService.useAgentChat(message, agentKey);
    res.status(200).send({
      code: 200,
      ActionType: "OK",
      data: result,
    });
  },
  getChatAgents: async (req, res) => {
    const result = await AgentService.getChatAgents();
    res.status(200).send({
      code: 200,
      ActionType: "OK",
      data: result,
    });
  },
};

module.exports = AgentController;
