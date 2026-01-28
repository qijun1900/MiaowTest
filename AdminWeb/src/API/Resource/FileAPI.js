import axios from "axios";
import upload from "@/util/upload";

/**
 * @description 上传文件资源
 * @param {file} file - 文件对象
 * @param {name} name - 文件名
 * @param {category} category - 资源分类ID
 * @param {description} description - 资源描述
 * @param {tags} tags - 资源标签，逗号分隔字符串
 * @param {ext} ext - 文件扩展名
 * @param {size} size - 文件大小，单位字节
 * @param {mimeType} mimeType - 文件MIME类型
 * @param {creator} creator - 创建者username
 * @returns {Promise} 上传结果
 */
export async function uploadFile(formdata) {
    try {
        const response = await upload("/adminapi/admin/file/upload", formdata);
        return response;
    }catch (error) {
        console.error("Error during file upload:", error);
        throw error;
    }
}

/**
 * @description 获取业务标签数组
 * @returns {Promise} 标签数组
 */
export async function getTags() {
    try {
        const response = await axios.get("/adminapi/admin/file/tags");
        return response.data;
    }catch (error) {
        console.error("Error during get tags:", error);
        throw error;
    }
}

/**
 * @description 获取资源
 * @param {Object} params - 查询参数，包括分页信息和其他筛选条件
 * @param {number} params.page - 当前页码，默认为1
 * @param {number} params.size - 每页显示的消息数量，默认为10
 * @param {string} params.search - 搜索关键词
 * @param {string} params.tag - 资源标签
 * @returns {Promise<Array>} 用户文件列表
 */
export async function getFileList(params) {
    try {
        const response = await axios.get("/adminapi/admin/file/list",{
             params:{
                page: params?.page || 1,
                size: params?.size || 10,
               ...params
            }
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching file list:", error);
        throw error;
    }
}

/**
 * @description 删除文件资源
 * @param {string} fileId - 文件资源ID
 * @returns {Promise} 删除结果
 */
export async function deleteFile(fileId) {
    try {
        const response = await axios.post("/adminapi/admin/file/deleteone", 
            {
                fileId: fileId
            }
        )
        return response.data;
    }catch (error) {
        console.error("Error during delete file:", error);
        throw error;
    }
    
}

/**
 * @description 更新文件资源
 * @param {Object} formdata - 更新数据
 * @param {string} formdata._id - 文件资源ID
 * @param {string} formdata.name - 文件名
 * @param {number} formdata.category - 资源分类ID
 * @param {string} formdata.tag - 业务标签
 * @param {string} formdata.description - 资源描述
 * @param {File} formdata.file - 新文件（可选）
 * @returns {Promise} 更新结果
 */
export async function updateFile(formdata) {
    try {
        console.log("Updating file with data:", formdata);
        const response = await upload("/adminapi/admin/file/update", formdata);
        return response;
    }catch (error) {
        console.error("Error during file update:", error);
        throw error;
    }
}