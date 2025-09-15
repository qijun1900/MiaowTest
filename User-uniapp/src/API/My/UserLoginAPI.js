import { http } from '../../util/http.js';

/**
 * 用户登录
 * @param {string} message - 登录信息
 * @param {string} code - 登录凭证
 * @returns {Promise} 返回用户登录数据
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