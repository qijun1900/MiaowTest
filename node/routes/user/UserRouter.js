var express = require('express');
const UserController = require('../../controllers/user/UserController');
var UserRouter = express.Router();

UserRouter.post("/uniappAPI/User/Userlogin", UserController.Userlogin)




module.exports = UserRouter;
