const NewsModel = require('../../models/NewsModel')
const NoticebarModel = require('../../models/NoticebarModel')
const NewsService ={
    add: async ({tittle,content,category,isPublish,cover,editTime})=>{
        return NewsModel.create({
            tittle,
            content,
            category,
            isPublish,
            cover,
            editTime
        })
    },
    getlist:async ({_id})=>{
        return _id?NewsModel.find({_id}):NewsModel.find({})
        
    },
    publish:async ({_id,isPublish,editTime})=>{
        return NewsModel.updateOne({_id},{isPublish,editTime})
    },
    delList: async ({_id})=>{
        return NewsModel.deleteOne({_id})
    },
    updatelist: async ({tittle,content,category,isPublish,cover,editTime,_id})=>{
        if(cover){
            return NewsModel.updateOne({_id},{
                tittle,content,category,isPublish,cover,editTime 
            })
        }else{
            return NewsModel.updateOne({_id},{
                tittle,content,category,isPublish,editTime 
            })
        }
    },
    addNoticebar: async ({content,isPublish,editTime})=>{
        return NoticebarModel.create({content,isPublish,editTime})
    },
    getNoticebar: async ()=>{
        return NoticebarModel.find({})
    },
    ChangeStateNoticebar: async ({_id,isPublish,editTime})=>{
        return NoticebarModel.updateOne({_id},{isPublish,editTime})
    },
    delNoticebar: async ({_id})=>{
        return NoticebarModel.deleteOne({_id})
    },
    getUpdatNoticebar:async ({content,_id,editTime})=>{
        return NoticebarModel.updateOne({_id},{content,editTime})
    },
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