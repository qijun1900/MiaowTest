/**
 * @description 路由跳转
 * @param {string} path - 路由路径
 * @param {Object} query - 路由参数
 * @returns {void}
 * @example
 * routerPush('/home', { id: 1 })
 */
import router from '@/router';
export default function (path,query) {
    router.push({path:path,query:query})
}
