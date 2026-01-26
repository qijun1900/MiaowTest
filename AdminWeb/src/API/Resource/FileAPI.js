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
