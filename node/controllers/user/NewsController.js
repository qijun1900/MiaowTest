const NewsService = require("../../services/user/NewsService");

const NewsController ={
    getNoticeInfo:async(req,res)=>{
        try {
            const result = await NewsService.getNoticeInfo(); // 调用服务层的方法获取数据
            res.status(200).send({
                code: 200, 
                data: result, 
            })
        } catch (error) {
            console.error('Error fetching notice info:', error); // 处理错误
        }
    },
    getIndexBanner:async(req,res)=>{
        try {
            const result = await NewsService.getIndexBanner(); 
            res.status(200).send({
                code: 200,
                data: result,
            })
        }catch (error) {
            console.error('Error fetching banner info:', error); 
        }
    }

}

module.exports = NewsController

