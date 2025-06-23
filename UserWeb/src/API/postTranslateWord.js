import axios from "axios";
const postTranslateWorld = async(word) =>{
    try{
        const res = await axios.post('/webapi/chat/postTranslateWorld', {word});
        if (res.data.code === 200) {
            return res.data; 
        }
        return null;
    }catch(error){
        console.error('Error in postTranslateWorld:', error);
        throw error; 
    }
}




export default postTranslateWorld;