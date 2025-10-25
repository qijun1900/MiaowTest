var express = require('express');
const UserController = require('../../controllers/user/UserController');
const JWT = require('../../MiddleWares/jwt');// ����JWT�м����������֤token
var UserRouter = express.Router();

UserRouter.post("/uniappAPI/User/Userlogin", UserController.Userlogin)//΢�ŵ�¼�ӿ�
UserRouter.post("/uniappAPI/User/UserRegister", UserController.UserRegister)//�û�ע��ӿ�
UserRouter.post("/uniappAPI/User/UserAccountLogin", UserController.UserAccountLogin)//�û��˺ŵ�¼�ӿ�
UserRouter.post("/uniappAPI/User/updateUserInfo", JWT.verifyTokenMiddleware(), UserController.updateUserInfo)//�û�������Ϣ�ӿ�
UserRouter.post("/uniappAPI/UserFavorite/addExamFavorite", JWT.verifyTokenMiddleware(),UserController.addExamFavorite)//����û��ղؿ��Խӿ�
UserRouter.post("/uniappAPI/UserFavorite/getExamFavorites", JWT.verifyTokenMiddleware(),UserController.getExamFavorites)//����Ƿ��ղؿ��Խӿ�
UserRouter.post("/uniappAPI/UserFavorite/removeExamFavorite", JWT.verifyTokenMiddleware(),UserController.removeExamFavorite)//�û�ȡ���ղؿ��Խӿ�
UserRouter.get("/uniappAPI/UserFavorite/getUserFavoritesExams", JWT.verifyTokenMiddleware(),UserController.getUserFavoritesExam)//�û���ȡ�ղصĿ��Խӿ�
UserRouter.post("/uniappAPI/User/BindAccount", JWT.verifyTokenMiddleware(),UserController.BindAccount)//�û����˺Žӿ�(wx)
UserRouter.get("/uniappAPI/User/checkUserBind", JWT.verifyTokenMiddleware(),UserController.checkUserBind)//�û�����Ƿ���˺Žӿ�(wx)
UserRouter.post("/uniappAPI/Feedback/submitFeedback", JWT.verifyTokenMiddleware(),UserController.userFeedback)//�û��ύ�����ӿ�(wx)




module.exports = UserRouter;
