import axios from "axios";

/**
 * @description: 添加网盘资料
 * @param {*} data 网盘资料信息
 * @param {*String} data.title 网盘资料名称，必填
 * @param {*Number} data.type 网盘类型，1-夸克，2-百度，必填
 * @param {*String} data.url 网盘资料链接，必填
 * @param {*String} data.description 网盘资料描述，可选
 * @param {*Boolean} data.isPublish 发布状态，0-未发布，1-已发布，默认0
 * @param {*String} data.examId 考试ID，必填
 * @return {* Object}  
 **/
export async function postAddNetDiskAPI(data) {
    try {
        const response = await axios.post("/adminapi/netDisk/addNetDisk", data);
        return response.data;
    } catch (error) {
        console.error("Error during add net disk:", error);
    }
}

/**
 * @description: 获取网盘资料列表
 * @param {*Number} params.page 当前页码，默认为1
 * @param {*Number} params.size 每页显示的数量，默认为10
 * @return {*Object}  网盘资料列表
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

/**
 * @description: 更新网盘资料信息
 * @param {*String} data 网盘资料信息
 * @param {*String} data._id 网盘资料ID，******必填 *****
 * @param {*String} data.title 网盘资料名称，必填
 * @param {*Number} data.type 网盘类型，1-夸克，2-百度，必填
 * @param {*String} data.url 网盘资料链接，必填
 * @param {*String} data.description 网盘资料描述，可选
 * @param {*Boolean} data.isPublish 发布状态，0-未发布，1-已发布，默认0
 * @param {*String} data.examId 考试ID，必填
 * @returns 
 */
export async function updateNetDiskAPI(data) {
    try {
        const response = await axios.post("/adminapi/netDisk/updateNetDisk", data);
        return response.data;
    } catch (error) {
        console.error("Error during update net disk:", error);
    }
}

/**
 * 
 * @param {*String} _id 
 * @param {*String} examId 
 * @returns 
 */
export async function deleteOneNetDiskAPI(_id, examId) {
    try {
        console.log("deleteOneNetDiskAPI", _id, examId);
        const response = await axios.post("/adminapi/netDisk/deleteOneNetDisk", 
            { _id, examId }
        );
        return response.data;
    } catch (error) {
        console.error("Error during delete one net disk:", error);
    }
}

/**
 * @param {*String} params._id 网盘资料ID，必填
 * @param {*String} params.examId 考试ID，必填
 * @param {*Boolean} params.state 发布状态，true-发布，false-未发布，默认false
 * @returns {*Object}
 */
export async function updateNetDiskStateAPI({ _id, examId, state }) {
    try {
        const response = await axios.post("/adminapi/netDisk/updateNetDiskState", 
            { _id, examId, state }
        );
        return response.data;
    } catch (error) {
        console.error("Error during update net disk state:", error);
    }
}