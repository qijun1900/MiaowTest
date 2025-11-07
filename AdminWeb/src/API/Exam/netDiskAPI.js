import axios from "axios";

/**
 * @description: 添加网盘资料
 * @param {*} data 网盘资料信息
 * @param {*} data.title 网盘资料名称，必填
 * @param {*} data.type 网盘类型，1-夸克，2-百度，必填
 * @param {*} data.url 网盘资料链接，必填
 * @param {*} data.description 网盘资料描述，可选
 * @param {*} data.isPublish 发布状态，0-未发布，1-已发布，默认0
 * @return {*} 成功返回true，失败返回false
 **/
export async function postAddNetDiskAPI(data) {
    try {
        console.log("Adding net disk:", data);
        const response = await axios.post("/adminapi/netDisk/addNetDisk", data);
        return response.data;
    } catch (error) {
        console.error("Error during add net disk:", error);
    }
}

/**
 * @description: 获取网盘资料列表
 * @param {*} params.page 当前页码，默认为1
 * @param {*} params.size 每页显示的数量，默认为10
 * @return {* Array}  网盘资料列表
 */
export async function getNetDiskListAPI(params) {
    try {
        const response = await axios.get("/adminapi/netDisk/getNetDiskList", {
            params: {
                page: params?.page || 1,
                size: params?.size || 20,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error during get net disk list:", error);
    }
}

export async function updateNetDisk(data) {
    // 更新网盘资料信息
    try {
        const response = await axios.post("/adminapi/netDisk/updateNetDisk", data);
        return response.data;
    } catch (error) {
        console.error("Error during update net disk:", error);
    }
}

export async function deleteOneNetDisk(_id, examId) {
    // 删除单个网盘资料
    try {
        const response = await axios.post("/adminapi/netDisk/deleteOneNetDisk", { _id, examId });
        return response.data;
    } catch (error) {
        console.error("Error during delete one net disk:", error);
    }
}

export async function deleteManyNetDisk(_ids, examId) {
    // 删除多个网盘资料
    try {
        const response = await axios.post("/adminapi/netDisk/deleteManyNetDisk", { _ids, examId });
        return response.data;
    } catch (error) {
        console.error("Error during delete many net disk:", error);
    }
}

export async function updateNetDiskState({ _id, examId, state }) {
    // 更新单个网盘资料状态
    try {
        const response = await axios.post("/adminapi/netDisk/updateNetDiskState", { _id, examId, state });
        return response.data;
    } catch (error) {
        console.error("Error during update net disk state:", error);
    }
}