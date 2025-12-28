import axios from "axios";
import upload from "@/util/upload";

export async function postAddAnnouncement(data) {
    // 添加通知公告
    try {
        const response = await upload("/adminapi/announcement/add", data);
        if(response.ActionType === "OK") {
            return response; // 返回响应数据
        }else {
            return null; // 返回null表示添加失败
        }
    }catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
}
export async function getAnnouncementList(params) {
    // 获取通知公告列表
    try {
        const response = await axios.get("/adminapi/announcement/list",{
             params: { // 将参数放在params配置项中
                page: params?.page || 1,
                size: params?.size || 20,
                // 保留其他可能的查询参数
                ...params 
            }
        }); 
        if(response.data.code===200) {
            return response.data; // 返回响应数据
        }
        return null;
    }catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
}
export async function PostDeleteOneAnnouncement(_id) {
    // 删除单个信息
    try {
        const response = await axios.post("/adminapi/announcement/deloneannouncement",{_id});
        if(response.data.ActionType === "OK") {
            return response.data;
        }
    }catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
}

export async function PostDeleteManyAnnouncement(_ids) {
    // 删除多个信息
    try {
        const response = await axios.post("/adminapi/announcement/delmanyannouncement",{_ids});
        if(response.data.ActionType === "OK") {
            return response.data;
        } 
    }
    catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
    
}

export async function updateAnnouncementPublishStatus(_id, state) {
    // 更新公告发布状态
    try{
        const response = await axios.post("/adminapi/announcement/updatestatus", {_id, state});
        if(response.data.code ===200) {
            return response.data;
        }
        return null;
    }catch(error){
        console.error("Error during user login:", error);
        throw error;
    }

    
}
/**
 * @description: 编辑通知公告
 * @param {Object} data - 包含公告信息的对象
 * @returns {Object} - 服务器响应
 */
export async function postEditAnnouncement(data) {
    try {
        const response = await upload("/adminapi/announcement/edit", data);
        return response;
    } catch (error) {
        console.error("Error during edit announcement:", error);
        throw error;
    }
}

