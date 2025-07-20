import upload from '@/util/upload'

export async function postUploadInfo(info){
    try{    
        const response = await upload("/adminapi/user/upload", info);
        if(response.ActionType === "OK") {
            return response
        }else {
            return null
        }
    }catch (error) {
        console.error("Error during user login:", error);
        throw error; 
    }
}