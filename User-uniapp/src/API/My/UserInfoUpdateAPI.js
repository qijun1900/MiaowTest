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