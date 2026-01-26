const mongoose = require('mongoose')

const FileResourceSchema = new mongoose.Schema({
    // 基础信息
    name: { type: String, default: '' }, // 资源名称，默认可为原始文件名
    originalName: { type: String, default: '' }, // 原始文件名
    ext: { type: String, default: '' }, // 文件后缀名，如 .jpg, .pdf
    mimeType: { type: String, default: '' }, // MIME类型，如 image/jpeg
    size: { type: Number, default: 0 }, // 文件大小，单位字节
    
    // 存储信息
    url: { type: String, default: '' }, // 访问URL
    path: { type: String, default: '' }, // 本地存储路径或对象存储的key
    storage: { type: String, default: 'local' }, // 存储位置: local(本地), oss(阿里), cos(腾讯), kodo(七牛)
    hash: { type: String, default: '' }, // 文件指纹(MD5)，用于秒传和去重
    
    // 媒体属性 (图片/音视频)
    width: { type: Number, default: 0 }, // 宽度 (px)
    height: { type: Number, default: 0 }, // 高度 (px)
    duration: { type: Number, default: 0 }, // 时长 (秒)
    
    // 分类管理
    category: { type: Number, default: 0 }, // 资源分类ID: 1图片, 2文档, 3视频, 4音频, 5其他
    description: { type: String, default: '' }, // 资源描述/备注
    tags: { type: [String], default: [] }, // 业务标签数组
    
    // 状态与权限
    status: { type: Number, default: 1 }, // 状态: 0禁用, 1正常,3删除
    creator: { type: String, default: '' }, // 上传者ID或用户名
    
    // 时间信息
    createTime: { type: Date, default: Date.now }, // 创建时间
    editTime: { type: Date, default: Date.now }, // 最后修改时间
})

const FileResourceModel = mongoose.model('file_resource', FileResourceSchema)

module.exports = FileResourceModel
