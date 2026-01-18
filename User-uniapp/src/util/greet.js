/**
 * 获取问候语对象（包含文字、表情等信息）
 * @returns {Object} 问候语对象
 * @property {string} text - 问候语文字
 * @property {string} emoji - 对应的表情符号
 * @property {string} period - 时间段标识（morning, noon, afternoon, evening）
 * @property {number} hour - 当前小时数
 */
export function getGreetingInfo() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
        return {
            text: '早上好🌤️',
            emoji: '🌤️',
            period: 'morning',
            hour: hour
        };
    } else if (hour >= 12 && hour < 14) {
        return {
            text: '中午好☀️',
            emoji: '☀️',
            period: 'noon',
            hour: hour
        };
    } else if (hour >= 14 && hour < 19) {
        return {
            text: '下午好🌅',
            emoji: '🌅',
            period: 'afternoon',
            hour: hour
        };
    } else {
        return {
            text: '晚上好🌙',
            emoji: '🌙',
            period: 'evening',
            hour: hour
        };
    }
}

// 默认导出
export default {
    getGreetingInfo
};
