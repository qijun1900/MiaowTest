import { http } from '../../util/http.js';

/**
 * 更新用户信息
 * @param {Object} userInfo - 用户信息对象
 * @param {string} userInfo.nickname - 用户昵称
 * @param {number} userInfo.gender - 用户性别 (0:未知, 1:男, 2:女)
 * @returns {Promise} 返回更新用户信息的响应
 */
export const updateUserInfo = async(userInfo) => {
   try{
       return await http({
           url: '/uniappAPI/User/updateUserInfo',
           method: 'POST',
           data: userInfo,
       });
   }catch(error){
       console.error("updateUserInfo 失败", error);
       throw error;
   }
}
/**检测用户是否绑定
 * @param {string} uid - 用户唯一标识
 * @returns {Promise} 返回用户绑定信息的响应
 */
export const checkUserBind = async() => {
   try{
       return await http({
           url: '/uniappAPI/User/checkUserBind',
           method: 'GET',
       });
   }catch(error){
       console.error("checkUserBind 失败", error);
   }
}