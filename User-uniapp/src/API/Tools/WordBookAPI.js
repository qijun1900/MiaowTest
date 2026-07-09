import { http } from "../../util/http/request";

/**
 * @description 获取单词本列表
 */
export async function getWordBooksAPI() {
  try {
    return await http({
      url: "/uniappAPI/tools/wordbook/getWordBooks",
      method: "GET",
    });
  } catch (error) {
    console.error("getWordBooksAPI 失败", error);
    throw error;
  }
}

/**
 * @description 获取单词本详情
 */
export async function getWordBookDetailAPI(id) {
  try {
    return await http({
      url: `/uniappAPI/tools/wordbook/getWordBookDetail?id=${id}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getWordBookDetailAPI 失败", error);
    throw error;
  }
}

/**
 * @description 创建单词本
 */
export async function createWordBookAPI({ title, description }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordbook/createWordBook",
      method: "POST",
      data: {
        title,
        description,
      },
    });
  } catch (error) {
    console.error("createWordBookAPI 失败", error);
    throw error;
  }
}

/**
 * @description 更新单词本
 */
export async function updateWordBookAPI({ id, title, description }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordbook/updateWordBook",
      method: "POST",
      data: {
        id,
        title,
        description,
      },
    });
  } catch (error) {
    console.error("updateWordBookAPI 失败", error);
    throw error;
  }
}

/**
 * @description 删除单个单词本
 */
export async function deleteWordBookAPI(id) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordbook/deleteWordBook",
      method: "POST",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("deleteWordBookAPI 失败", error);
    throw error;
  }
}

/**
 * @description 批量删除单词本
 */
export async function batchDeleteWordBooksAPI(ids) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordbook/batchDeleteWordBooks",
      method: "POST",
      data: {
        ids,
      },
    });
  } catch (error) {
    console.error("batchDeleteWordBooksAPI 失败", error);
    throw error;
  }
}
