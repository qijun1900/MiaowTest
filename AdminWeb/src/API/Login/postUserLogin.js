import axios from "axios";
export const postUserLogin = async (loginForm) => {
    try{    
        const response = await axios.post("/adminapi/user/login", loginForm);
        return response.data;
    }catch (error) {
        console.error("Error during user login:", {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            code: error.code
        });
        throw new Error(`登录失败: ${error.response?.data?.message || '服务器内部错误'}`);
    }
}