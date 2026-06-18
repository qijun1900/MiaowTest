/**
 * 获取问候语对象（包含文字、表情等信息）
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

export default {
    getGreetingInfo
};
