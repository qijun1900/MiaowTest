const NewsModel = require('../../models/NewsModel')
const NoticebarModel = require('../../models/NoticebarModel')

const NewsService ={
    getNoticeInfo:async()=>{
        return NoticebarModel.find({isPublish:1}).sort({createdTime:-1})
    }
}

module.exports = NewsService