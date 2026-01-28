const express = require('express');
const FileController = require('../../controllers/admin/FileController');
const FileRouter = express.Router();
const { upload, uploadToOSS } = require('../../helpers/uploadHelper')

// 文件上传接口
FileRouter.post("/adminapi/admin/file/upload",upload.single('file'),uploadToOSS('fileresource'), FileController.uploadFile);
//获取业务标签数组
FileRouter.get("/adminapi/admin/file/tags", FileController.getTags);
//获取资源列表
FileRouter.get("/adminapi/admin/file/list", FileController.getFileList);
//删除文件资源
FileRouter.post("/adminapi/admin/file/deleteone", FileController.deleteFile);

module.exports = FileRouter;