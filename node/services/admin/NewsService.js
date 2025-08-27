const NewsModel = require('../../models/NewsModel')
const NewsService ={
    addAnnouncement: async ({title,content,category,isPublish,cover,creator,editTime})=>{
        return NewsModel.create({
            title,
            content,
            category,
            isPublish,
            cover,
            creator,
            editTime
        })
    },
    getAnnouncementList: async ({page, size})=>{
        // 分页查询
        const skip = (page - 1) * size
        const [data, total] = await Promise.all([
            NewsModel.find({})
                .skip(skip)
                .limit(size),
            NewsModel.countDocuments({})
        ])
      return { data, total };
    },
    DeleteOneAnnouncement: async ({_id})=>{
        return NewsModel.deleteOne({_id})
    },
    DeleteManyAnnouncement: async ({_ids})=>{
        return NewsModel.deleteMany({_id:{$in:_ids}})
    },
    updateStatus: async ({_id,state})=>{
        return NewsModel.updateOne({_id},{isPublish:state})
    }
}

module.exports = NewsService