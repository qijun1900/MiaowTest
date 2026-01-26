const express = require('express');
const FileController = require('../../controllers/admin/FileController');
const FileRouter = express.Router();
const { upload, uploadToOSS } = require('../../helpers/uploadHelper')

FileRouter.post("/adminapi/admin/file/upload",upload.single('file'),uploadToOSS('fileresource'), FileController.uploadFile);

module.exports = FileRouter;