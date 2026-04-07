import { http } from "../../util/http";

/**
 * @description 获取笔记本列表
 */
export async function getNotebooksAPI() {
  try {
    return await http({
      url: "/uniappAPI/tools/notebook/getNotebooks",
      method: "GET",
    });
  } catch (error) {
    console.error("getNotebooksAPI 失败", error);
    throw error;
  }
}

/**
 * @description 创建笔记本
 */
export async function createNotebookAPI({ title, description }) {
  try {
    return await http({
      url: "/uniappAPI/tools/notebook/createNotebook",
      method: "POST",
      data: {
        title,
        description,
      },
    });
  } catch (error) {
    console.error("createNotebookAPI 失败", error);
    throw error;
  }
}

/**
 * @description 获取笔记本详情
 */
export async function getNotebookDetailAPI(id) {
  try {
    return await http({
      url: `/uniappAPI/tools/notebook/getNotebookDetail?id=${id}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getNotebookDetailAPI 失败", error);
    throw error;
  }
}

/**
 * @description 更新笔记本
 */
export async function updateNotebookAPI({ id, title, description }) {
  try {
    return await http({
      url: "/uniappAPI/tools/notebook/updateNotebook",
      method: "POST",
      data: {
        id,
        title,
        description,
      },
    });
  } catch (error) {
    console.error("updateNotebookAPI 失败", error);
    throw error;
  }
}