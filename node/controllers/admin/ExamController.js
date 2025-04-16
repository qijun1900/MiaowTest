const ExamService = require("../../services/admin/ExamService");

const ExamController ={
    add:async (req,res) => {
        const cover = req.file?`/examcoveruploads/${req.file.filename}`:""   
        const {name,code,category,year,isPublish } = req.body
        // 修复：解析JSON字符串并转换为数字数组
        const parsedCategory = JSON.parse(category).map(Number)
        await ExamService.add({
            name,
            code,
            category: parsedCategory, // 使用转换后的数组
            year,
            isPublish:Number(isPublish),
            cover,
            createdTime:new Date()
        })
        res.send({
            ActionType: "OK",
        }) 
    },
    getexamList:async (req,res)=>{
        const result = await ExamService.getexamList({_id:req.params.id})
        res.send({
            ActionType: "OK",
            data: result
        })    
    },
    updateInfo:async(req,res)=>{
        const cover = req.file?`/examcoveruploads/${req.file.filename}`:""   
        const {name,code,category,year,isPublish,_id} = req.body
        const parsedCategory = JSON.parse(category).map(Number)
        await ExamService.updateInfo({
            name,
            code,
            category: parsedCategory, 
            year,
            isPublish:Number(isPublish),
            createdTime:new Date(),
            cover,
            _id
        })
        res.send({
            ActionType: "OK",
        })
    },
}
module.exports = ExamController