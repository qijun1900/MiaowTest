/**
 * @description: 用户考试与网盘资料模型
 * @param {*} questionTitle 考试题型信息数组
 * @param {*} questionTitle[].content 题型名称，如"单选题"、"多选题"等
 * @param {*} questionTitle[].description 题型的详细描述
 * @param {*} questionTitle[].questionIdS 关联的题目ID集合，数组形式存储
 * @param {*} questionTitle[].isPublish 发布状态，0-未发布，1-已发布
 * 
 * @param {*} netDiskTitle 网盘资料信息数组
 * @param {*} netDiskTitle[].title 网盘资料名称，必填
 * @param {*} netDiskTitle[].description 网盘资料的详细描述，可选
 * @param {*} netDiskTitle[].content 网盘链接数组
 * @param {*} netDiskTitle[].content[].type 网盘类型，1-夸克，2-百度，必填
 * @param {*} netDiskTitle[].content[].url 网盘资料链接，必填
 * @param {*} netDiskTitle[].content[].accessCode 访问密码/提取码，可选
 * @param {*} netDiskTitle[].isPublish 发布状态，0-未发布，1-已发布，默认0
 * @param {*} netDiskTitle[].createTime 创建时间，默认当前时间
 * 
 * @param {*} examId 考试ID，用于关联具体的考试
 * @return {*} UserExamModel mongoose模型实例
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  questionTitle: [{
    content: String,                           // 题型名称
    description: String,                          // 题型描述
    questionIdS: [{ type: Array }],           // 关联的题目ID集合
    isPublish: Number,                     // 发布状态
  }],

  netDiskTitle: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: false,
      trim: true
    },
    content: [{
      type: {
        type: Number,
        required: true,
        enum: [1, 2] // 1-夸克，2-百度，便于扩展
      },
      url: {
        type: String,
        required: true,
      },
      accessCode: {
        type: String,
        required: false,
      }
    }],
    isPublish: {
      type: Boolean,
      default: false,
    },
    createTime: {
      type: Date,
      default: Date.now
    }
  }],
  examId: String,                          // 考试ID
});

const UserExamModel = mongoose.model("userexam", UserSchema);

module.exports = UserExamModel