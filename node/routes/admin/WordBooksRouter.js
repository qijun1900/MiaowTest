const express = require('express');
const WordBooksController = require('../../controllers/admin/WordBooksController');
const WordBooksRouter = express.Router();
const { upload, uploadToOSS } = require('../../helpers/uploadHelper')

// 获取词书列表
WordBooksRouter.get('/adminapi/wordbooks/list',WordBooksController.getWordBooksList);

// 更新词书信息
WordBooksRouter.post('/adminapi/wordbooks/update',upload.single('file'),uploadToOSS('wordsbookscoveruploads'), WordBooksController.updateWordBook);

// 删除单个词书
WordBooksRouter.post('/adminapi/wordbooks/deleteOne', WordBooksController.deleteOneWordBook);

// 批量删除词书
WordBooksRouter.post('/adminapi/wordbooks/deleteMany', WordBooksController.deleteManyWordBooks);

module.exports = WordBooksRouter;
