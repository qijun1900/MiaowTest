var express = require('express');
const ResourceController = require('../../controllers/user/ResourceController');
const JWT = require('../../MiddleWares/jwt');
var ResourceRouter = express.Router();

//通过业务标签获取资源
ResourceRouter.post("/uniappAPI/resource/user/getResourceList",JWT.verifyTokenMiddleware(),ResourceController.getResourceList)





module.exports = ResourceRouter; 