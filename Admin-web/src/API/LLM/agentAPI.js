import axios from "axios";

export async function postAddAgent(data) {
  try {
    const res = await axios.post("/adminapi/agent/addagent", data);
    return res.data;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getAgentList(params) {
  try {
    const res = await axios.get("/adminapi/agent/getagentlist", {
      params: {
        page: params?.page || 1,
        size: params?.size || 20,
        ...params,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function updateAgentPublishStatus(_id, state) {
  try {
    const res = await axios.post("/adminapi/agent/changestatus", { _id, state });
    return res.data;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function postDeleteOneAgent(_id) {
  try {
    const response = await axios.post("/adminapi/agent/deloneagent", { _id });
    if (response.data.code === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error during delete one agent:", error);
  }
}

export async function postDeleteManyAgent(_ids) {
  try {
    const response = await axios.post("/adminapi/agent/delmanyagent", { _ids });
    if (response.data.code === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error during delete many agent:", error);
  }
}

export async function postUpdateAgent(data) {
  try {
    const response = await axios.post("/adminapi/agent/updateagent", data);
    return response.data;
  } catch (error) {
    console.error("Error during update agent:", error);
  }
}

export async function testChatAPI(messages, agentKey) {
  try {
    const response = await axios.post("/adminapi/agent/chat", {
      message: messages,
      agentKey
    });
    return response.data;
  } catch (error) {
    console.error("Error querying model chat:", error);
    throw error;
  }
}

export async function getChatAgents() {
  try {
    const response = await axios.get("/adminapi/agent/getchatagents");
    return response.data;
  } catch (error) {
    console.error("Error fetching chat agents:", error);
    throw error;
  }
}