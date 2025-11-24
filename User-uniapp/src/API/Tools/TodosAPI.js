import { http } from "../../util/http";

/**
 *  设置今日待办事项接口-
 * @method POST
 * @param {*String} fulldate 日期 格式为 yyyy-MM-dd 
 * @param {*Object} todoForm 待办事项 格式为 {title: '标题', description: '描述',}
 * @returns {Promise} 返回添加题目结果
 */
export async function setTodayTodosAPI({fulldate,todoForm}) {
    try {
        return  await http({
		url: '/uniappAPI/set/TodayTodos',
		method: 'POST',
		data: {
            fulldate: fulldate,
            todos_content: todoForm,
		}
	})
    }catch (error) {
        console.error("setTodayTodos 失败", error);
    	
    }
}

/**
 * 获取获取dotDates 
 * @method GET
 *  @returns {Promise}
 */
export async function getDotDatesAPI() {
    try {
        return  await http({
            url: '/uniappAPI/get/dotDates',
            method: 'GET',	
        })
    }catch (error) {
        console.error("getDotDates 失败", error);
    }
}

/**
 * 获取今日待办事项接口-
 * @method POST
 * @param {*String} fulldate 日期 格式为 yyyy-MM-dd
 * @returns {Promise} 返回添加题目结果
 */
export async function getTodayTodosAPI(fulldate) {
    try {
        return  await http({
            url: '/uniappAPI/get/TodayTodos',
            method: 'POST',
            data: {
                fulldate: fulldate,
            }
        })
    }catch (error) {
        console.error("getTodayTodos 失败", error);
    }
		
}