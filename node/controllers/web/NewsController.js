const NewsService = require("../../services/web/NewsService");

const NewsController ={
    getNoticeInfo:async(req,res)=>{
        try {
            const result = await NewsService.getNoticeInfo(); // 调用服务层的方法获取数据
            res.send({
                code: 200, 
                data: result, 
            })
        } catch (error) {
            console.error('Error fetching notice info:', error); // 处理错误
        }
    }

}

module.exports = NewsController

