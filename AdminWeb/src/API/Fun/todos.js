import axios  from "axios";
export  async function getTodos(){
    // 发送请求到后端，获取todo
    try{
        const response = await axios.get("/adminapi/todos/gettodos");
        if(response.data.code===200) {
            return response.data;
        }else{
            return null;
        }
    }catch(error){
        console.log(error);
    }
}

export async function postTodos (data){
    // 发送请求到后端，添加todo
    try{
        const response = await axios.post("/adminapi/todos/addtodo",data);
        if(response.data.code===200) {
            return response.data;
        }else{
            return null;
        }
    }catch(error){
        console.log(error);
    }

}
export async function postDeleteTodos (_id){
    // 发送请求到后端，删除todo
    try{
        const response = await axios.post("/adminapi/todos/deltodo",{_id});
        if(response.data.code===200) {
            return response.data;
        }else{
            return null;
        }
    }catch(error){
        console.log(error);
    }
    
}
export async function postUpdateTodos (_id){
    // 发送请求到后端，更新todo
    try{
        const response = await axios.post("/adminapi/todos/updatetodo",{_id});
        if(response.data.code===200) {
            return response.data;
        }else{
            return null;
        }
    }catch(error){
        console.log(error);
    }
}
