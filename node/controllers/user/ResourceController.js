const ResourceService = require("../../services/user/ResourceService");

const ResourceController ={
    getResourceList:async(req,res)=>{
        try{
            const {tag} =req.body
            if(!tag){
                res.send({
                    code: 400,  
                    message: '缺少必要参数tag'
                });
                return;
            }
            const resourceList = await ResourceService.getResourceList({tag});
            if(resourceList){
                res.send({
                    code: 200,
                    data: resourceList,
                });
            }else{
                res.send({
                    code: 404,
                });
            }
        }catch(error){
            console.error("getResourceList 失败", error);
            res.send({
                code: 500,
                ActionType: "ERROR",
                message: '服务器错误'
            });
        }
    }
}


module.exports = ResourceController