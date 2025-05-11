const ExamService = require("../../services/web/ExamService");

const ExamController ={
    getExamList:async (req,res)=>{
        const result = await ExamService.getExamList()
        res.send({
            code:200,
            ActionType: "OK",
            data: result 
        })
    },


}

module.exports = ExamController