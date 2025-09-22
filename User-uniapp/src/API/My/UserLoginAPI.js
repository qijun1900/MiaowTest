import { http } from '../../util/http.js';

/**
 * 微信用户登录/注册 
 * @param {string} message - 登录信息
 * @param {string} code - 登录凭证
 * @returns {Promise} 返回用户登录结果
 * 
 */
export const Userlogin = async(message,code) => {
   try{
       return await http({
           url: '/uniappAPI/User/Userlogin',
           method: 'POST',
            data: {
               message,
               code,
            },
       });

   }catch(error){
       console.error("Userlogin 失败", error);
       throw error;
   }
}

/**
 * 用户账号注册(h5/wx)
 * @param  {string} account - 用户账号
 * @param  {string} verifyCode - 验证码
 * @param  {string} password - 密码
 * @returns {Promise} 返回注册用户信息响应
 *
 */
export const UserRegister = async({account,verifyCode,password}) => {
   try{
       if (!account || !verifyCode || !password) {
           throw new Error("缺少必要参数");
       }
       return await http({
           url: '/uniappAPI/User/UserRegister',
           method: 'POST',
            data: {
               account,
               verifyCode,
               password,
            }
       });
   }catch(error){
       console.error("UserRegister 失败", error);
       throw error;
   }
}

/**
 * 用户使用账号登录(h5/wx)
 * @param  {string} account - 用户账号
 * @param  {string} password - 密码
 * @returns {Promise} 
 **/
export const UserAccountLogin = async({account,password}) => {
   try{
       if (!account ||!password) {
           throw new Error("请输入账号和密码");
       }
       return await http({
           url: '/uniappAPI/User/UserAccountLogin',
           method: 'POST',
            data: {
               account,
               password,
            }
       });
   }catch(error){
       console.error("UserAccountLogin 失败", error);
       throw error;
   }
}

/**
 * 微信用户绑定账号
 * @param  {string} account - 用户账号
 * @param  {string} verifyCode - 验证码
 * @param  {string} password - 密码
 * @returns {Promise} 返回绑定结果
 */
export const BindAccount = async({account,verifyCode,password}) => {
   try{
       if (!account || !verifyCode || !password) {
           throw new Error("缺少必要参数");
       }
       return await http({
           url: '/uniappAPI/User/BindAccount',
           method: 'POST',
            data: {
               account,
               verifyCode,
               password,
            }
       });
   }catch(error){
       console.error("BindAccount 失败", error);
       throw error;
   }
}
