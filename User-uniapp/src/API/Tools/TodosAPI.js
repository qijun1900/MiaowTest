import { http } from "../../util/http";

/**
 * 
 * @param {*String} fulldate 日期 格式为 yyyy-MM-dd 
 * @param {*Object} todoForm 待办事项 格式为 {title: '标题', description: '描述',}
 * @returns 
 */
export async function setTodayTodos({fulldate,todoForm}) {
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