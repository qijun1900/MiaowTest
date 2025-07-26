import axios from "axios";

export async function postAddModel(data) {
    try {
        const res = await axios.post("/adminapi/model/addmodel", data)
        return res.data
    
    }catch (error) {
        console.error("Error:", error);
    }
}
export async function getModelList(params) {
    // 获取模型列表
    try {
        const res = await axios.get("/adminapi/model/getmodelList", {
            params:{
                page: params?.page || 1,
                size: params?.size || 20,
                // 保留其他可能的查询参数
            ...params
        }})
        return res.data
    }catch (error) {
        console.error("Error:", error);
    }
}
export async function updateModelPublishStatus(_id, state) {
    try {
        const res = await axios.post("/adminapi/model/updateModelPublishStatus", {_id, state})
        return res.data
    }catch (error) {
        console.error("Error:", error);
    }
}
export async function postDeleteOneModel(_id) {
    // 删除单个考试信息
    try {
        const response = await axios.post("/adminapi/model/deloneModel",{_id});
        if(response.data.code === 200) {
            return response.data;
        }  
    }catch (error) {
        console.error("Error during delete one model:", error);
    }
    
}
export async function postDeleteManyModel(_ids) {
    // 删除多个
    try {
        const response = await axios.post("/adminapi/model/delmanyModel",{_ids});
        if(response.data.code === 200) {
            return response.data;
        }
    }catch (error) {
        console.error("Error during delete many model:", error);
    }
    
}

export async function postUpdateModel(data) {
    // 修改更新模型信息
    try {
        const response = await axios.post("/adminapi/model/updateModel", data);
        return response.data;
    }catch (error) {
        console.error("Error during update model:", error);
    }
}
