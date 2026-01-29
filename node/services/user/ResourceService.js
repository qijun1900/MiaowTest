const FileResourceModel = require('../../models/FileResourceModel');
const ResourceService ={
    getResourceList:async({tag})=>{
        try{

            const query = { status: 1 }; // 只获取状态为正常的资源

            if(tag){
                query.tag = tag;
            }
            const resources = await FileResourceModel.find(query,{
                url: 1,
            }).sort({ createTime: -1 }).exec();
            return resources;
        }catch(error){
            console.error(" ADTDBASE ERROR 失败", error);
            throw error;
        }
    }
}




module.exports = ResourceService 