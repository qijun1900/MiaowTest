const mongoose = require('mongoose')

const UserTodosSchema = new mongoose.Schema({
    Uid: {
        type: mongoose.Schema.Types.ObjectId, // 关联用户表的主键
        ref: 'consumer', 
        required: true, 
    },
    fulldate: { // 完整日期，格式为 YYYY-MM-DD '2025-11-24'，通过
        type: String,
        required: true,
    },
    todos_content:{
        type:[{ // 代办内容数组，可以包含添加多个代办项
            _id: { // 数组元素的唯一标识
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            },
            title: { // 代办标题
                type: String,
                default: ''
            },
            description: { // 代办描述
                type: String,
                default: ''
            },
            isCompleted: { // 是否完成
                type: Boolean,
                default: false
            }
        }]
    }
})


// 添加索引以提高查询性能
UserTodosSchema.index({ Uid: 1, fulldate: 1 })

const UserTodosModel = mongoose.model("user_todo", UserTodosSchema)

module.exports = UserTodosModel