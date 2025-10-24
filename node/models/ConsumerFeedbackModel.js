const mongoose = require('mongoose');
/**
 * @description: 消费者反馈模型
 * @param {*} userId 提交反馈的用户ID，关联consumer表
 * @param {*} type 反馈类型，1-系统反馈 2-题目反馈 3-功能建议 4-其他
 * @param {*} title 反馈标题，必填
 * @param {*} content 反馈内容，必填
 * @param {*} relatedId 关联ID（如题目ID、考试ID等），可选
 * @param {*} contactInfo 联系方式，可选
 * @param {*} status 反馈处理状态，0-待处理 1-处理中 2-已处理，默认0
 * @param {*} adminReply 管理员回复，可选
 * @param {*} adminId 处理反馈的管理员ID，关联user表，可选
 * @param {*} replyTime 回复时间，可选
 * @param {*} createTime 创建时间，默认当前时间
 * @return {*}
 */
const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consumer',
        required: true,//必填
        index: true//添加索引
    }, // 提交反馈的用户ID，关联consumer表
    type: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4], // 1-系统反馈 2-题目反馈 3-功能建议 4-其他
        default: 1
    }, // 反馈类型
    title: {
        type: String,
        required: true,
    }, // 反馈标题
    content: {
        type: String,
        required: true,
    }, // 反馈内容
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }, // 关联ID（如题目ID、考试ID等）
    contactInfo: {
        type: String,
        maxlength: 100
    }, // 联系方式（可选）
    status: {
        type: Number,
        required: true,
        enum: [0, 1, 2], // 0-待处理 1-处理中 2-已处理
        default: 0
    }, // 反馈处理状态
    adminReply: {
        type: String,
    }, // 管理员回复
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    }, // 处理反馈的管理员ID
    replyTime: {
        type: Date,
        default: null
    }, // 回复时间
    createTime: {
        type: Date,
        default: Date.now,
    }, // 创建时间
})

const FeedbackModel = mongoose.model("consumer_feedback", FeedbackSchema)
module.exports = FeedbackModel
