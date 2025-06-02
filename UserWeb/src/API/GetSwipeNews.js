import axios from 'axios';
const getSwipeNews = async () => {
    try {
        const res = await axios.get('/webapi/News/getSwipeNews');
        if (res.data.code === 200) {
            return res.data.data; // 返回数据而不是console.log
        }
        return null; // 如果code不是200，返回null
    } catch (error) {
        console.error('Error fetching swipe news:', error);
        throw error; // 可以选择抛出错误让调用者处理
    }
};
export default getSwipeNews;
