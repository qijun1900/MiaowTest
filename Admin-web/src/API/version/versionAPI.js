import axios from "axios";
import upload from "@/util/upload";

// 新增版本（含文件上传）
export async function postAddVersion(data, options = {}) {
  try {
    const response = await upload("/adminapi/appversion/add", data, options);
    return response;
  } catch (error) {
    console.error("新增版本失败:", error);
    throw error;
  }
}

// 获取版本列表
export async function getVersionList(params) {
  try {
    const response = await axios.get("/adminapi/appversion/list", {
      params: { page: params?.page || 1, size: params?.size || 20, ...params },
    });
    if (response.data.code === 200) return response.data;
    return null;
  } catch (error) {
    console.error("获取版本列表失败:", error);
    throw error;
  }
}

// 编辑版本（含文件上传）
export async function postEditVersion(data, options = {}) {
  try {
    const response = await upload("/adminapi/appversion/edit", data, options);
    return response;
  } catch (error) {
    console.error("编辑版本失败:", error);
    throw error;
  }
}

// 删除单个版本
export async function postDeleteOneVersion(_id) {
  try {
    const response = await axios.post("/adminapi/appversion/delete", { _id });
    if (response.data.ActionType === "OK") return response.data;
  } catch (error) {
    console.error("删除版本失败:", error);
    throw error;
  }
}

// 批量删除版本
export async function postDeleteManyVersions(_ids) {
  try {
    const response = await axios.post("/adminapi/appversion/deletemany", { _ids });
    if (response.data.ActionType === "OK") return response.data;
  } catch (error) {
    console.error("批量删除版本失败:", error);
    throw error;
  }
}

// 更新版本状态
export async function updateVersionStatus(_id, status) {
  try {
    const response = await axios.post("/adminapi/appversion/status", { _id, status });
    if (response.data.code === 200) return response.data;
    return null;
  } catch (error) {
    console.error("更新版本状态失败:", error);
    throw error;
  }
}
