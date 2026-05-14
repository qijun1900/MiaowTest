const express = require("express");
const AgentController = require("../../controllers/admin/AgentController");
const AgentRouter = express.Router();

AgentRouter.post("/adminapi/agent/addagent", AgentController.addAgent);
AgentRouter.get("/adminapi/agent/getagentlist", AgentController.getAgentList);
AgentRouter.post("/adminapi/agent/updateagent", AgentController.updateAgent);
AgentRouter.post("/adminapi/agent/deloneagent", AgentController.deleteOneAgent);
AgentRouter.post(
  "/adminapi/agent/delmanyagent",
  AgentController.deleteManyAgent,
);
AgentRouter.post("/adminapi/agent/changestatus", AgentController.changeStatus);
AgentRouter.post("/adminapi/agent/chat", AgentController.useAgentChat);
AgentRouter.get("/adminapi/agent/getchatagents", AgentController.getChatAgents);

module.exports = AgentRouter;
