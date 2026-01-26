// import axios from "axios";
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
 * @returns {Promise} 上传结果
 */
export async function uploadFile(formdata) {
    try {
        console.log("Uploading file with data:", formdata);
        const response = await upload("/adminapi/admin/file/upload", formdata);
        return response;
    }catch (error) {
        console.error("Error during file upload:", error);
        throw error;
    }
}
