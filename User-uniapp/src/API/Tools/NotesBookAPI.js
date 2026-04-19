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

/**
 * @description 删除笔记本
 */
export async function deleteNotebookAPI(id) {
  try {
    return await http({
      url: "/uniappAPI/tools/notebook/deleteNotebook",
      method: "POST",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("deleteNotebookAPI 失败", error);
    throw error;
  }
}

/**
 * @description 获取笔记本下的笔记列表
 */
export async function getNotebookNotesAPI(
  bookId,
  { page = 1, pageSize = 12, keyword = "" } = {},
) {
  try {
    const query = [
      `bookId=${encodeURIComponent(bookId)}`,
      `page=${encodeURIComponent(page)}`,
      `pageSize=${encodeURIComponent(pageSize)}`,
      `keyword=${encodeURIComponent(keyword)}`,
    ].join("&");

    return await http({
      url: `/uniappAPI/tools/notebook/getNotebookNotes?${query}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getNotebookNotesAPI 失败", error);
    throw error;
  }
}

/**
 * @description 获取单条笔记详情
 */
export async function getNotebookNoteDetailAPI({ id, bookId }) {
  try {
    const query = bookId
      ? `id=${id}&bookId=${bookId}`
      : `id=${id}`;
    return await http({
      url: `/uniappAPI/tools/notebook/getNotebookNoteDetail?${query}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getNotebookNoteDetailAPI 失败", error);
    throw error;
  }
}

/**
 * @description 保存笔记（新建/更新）
 */
export async function saveNotebookNoteAPI({ id, bookId, title, content, tags }) {
  try {
    return await http({
      url: "/uniappAPI/tools/notebook/saveNotebookNote",
      method: "POST",
      data: {
        id,
        bookId,
        title,
        content,
        tags,
      },
    });
  } catch (error) {
    console.error("saveNotebookNoteAPI 失败", error);
    throw error;
  }
}

/**
 * @description 删除单条笔记
 */
export async function deleteNotebookNoteAPI({ id, bookId }) {
  try {
    return await http({
      url: "/uniappAPI/tools/notebook/deleteNotebookNote",
      method: "POST",
      data: {
        id,
        bookId,
      },
    });
  } catch (error) {
    console.error("deleteNotebookNoteAPI 失败", error);
    throw error;
  }
}