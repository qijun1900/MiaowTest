var express = require('express');
const ProductController = require('../../controllers/web/ProductController');
var ProductRouter = express.Router();



ProductRouter.get('/webapi/product/list',ProductController.getList)



module.exports = ProductRouter; 