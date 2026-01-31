const NewsModel = require('../../models/NewsModel')
const {deleteFile} = require('../../helpers/ossHelper');
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
    },
    editAnnouncement: async ({_id,title,content,category,isPublish,cover,creator})=>{
        if (cover) {
            // 删除旧封面文件
            const news = await NewsModel.findById(_id);
            if (news && news.cover) {
                await deleteFile(news.cover);
            }
            return NewsModel.updateOne({_id},{title,content,category,isPublish,cover,creator})
        } else {
            return NewsModel.updateOne({_id},{title,content,category,isPublish,creator})
        }
    }
}

module.exports = NewsService