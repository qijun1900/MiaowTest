import axios from "axios";
const getNoticeInfo = async () => {
    try {
        const res = await axios.get("/webapi/Notice/getNoticInfo")
        if (res.data.code === 200) {
            return res.data.data; 
        }  
    }catch (error) {
        console.error('Error fetching exam details:', error);
        throw error;
    }
}
export default getNoticeInfo