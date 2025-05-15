const ExamService = require("../../services/web/ExamService");

const ExamController ={
    getExamList:async (req,res)=>{
        try {
            const result = await ExamService.getExamList()
            res.send({
                code:200,
                ActionType: "OK",
                data: result 
            })
        }catch (error) {
            console.error('Error fetching getExamList details:', error); // 处理错误
        }
    },
    getOneExam:async (req,res)=>{
        try {
            const id = req.params.id;
            const result = await ExamService.getOneExam(id) 
            res.send({
                code:200,
                ActionType: "OK",
                data: result 
            })
        } catch (error) {
            console.error('Error fetching getOneExam details:', error); // 处理错误 
        }
    },
    getUserExamInfo:async (req,res)=>{
        try {
            const id = req.params.id;
            const result = await ExamService.getUserExamInfo(id) 
            res.send({
                code:200,
                ActionType: "OK",
                data: result
            })
        } 
        catch (error) {
            console.error('Error fetching getUserExamInfo details:', error); // 处理错误 
        }
    }
}

module.exports = ExamController