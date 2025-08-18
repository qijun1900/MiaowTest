import axios  from "axios";

export async function testModelAppAPI(message) {
    try {
        const res = await axios.post("/adminapi/modelapp/test",{message} )
        return res.data
    }catch (error) {
        console.error("Error:", error);
    }
}