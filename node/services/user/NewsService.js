const NewsModel = require('../../models/NewsModel')

const NewsService ={
    getNoticeInfo:async()=>{
        try {
            return await NewsModel.find({isPublish:1,category:2},{
                cover:0,
                isPublish:0,
                category:0,
                creator:0,
                editTime:0,
                __v:0
            }) 
        }catch(error){
            console.log(error)
        }
    }
}

module.exports = NewsService