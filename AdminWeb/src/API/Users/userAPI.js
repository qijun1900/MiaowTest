import axios from "axios";
import upload from "@/util/upload";

export async function getUserList(params) {
    // 获取用户列表（添加分页参数）
    try {
        const response = await axios.get("/adminapi/user/list", {
            params: { // 将参数放在params配置项中
                page: params?.page || 1,
                size: params?.size || 20,
                // 保留其他可能的查询参数
                ...params 
            }
        });
        if(response.data.ActionType === "OK") {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user list:", error); // 修正错误描述
        throw error;
    }
}

export async function postAddUser(userData) {
    // 添加用户
    try {
        const response = await upload("/adminapi/user/add", userData);
        if(response.ActionType === "OK") {
            return response; 
        }
        else {
            return null;
        }
    }catch (error) {
        console.error("Error during user login:", error);
        throw error; 
    }
}
export async function PostDeleteOneUser(_id) {
    // 删除单个用户
    try {
        const response = await axios.post("/adminapi/user/deloneuser",{_id});
        if(response.data.ActionType === "OK") {
            return response.data;
        }
    }catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
}

export async function PostDeleteManyUser(_ids) {
    // 删除多个用户
    try {
        const response = await axios.post("/adminapi/user/delmanyuser",{_ids});
        if(response.data.ActionType === "OK") {
            return response.data;
        } 
    }
    catch (error) {
        console.error("Error during user login:", error);
        throw error;
    }
    
}
// 编辑用户信息
export async function postEditUser(userData) {
  try {
    const response = await axios.post("/adminapi/user/edituser", userData)
    console.log(response.data)
    if(response.data.ActionType === "OK") {
      return response.data
    } 
  } catch (error) {
    console.error("Error during user edit:", error)
    throw error
  }
}