const FunctionService = require("../../services/admin/FunctionService");

const FunctionController ={
    AddTodos:async (req,res)=>{
        const {title} = req.body;
        console.log(title)
        await FunctionService.AddTodos({title})
        res.status(200).send({
            ActionType:"OK",
            code:200,
        })
    },
    GetTodos:async (req,res)=>{
        const result = await FunctionService.GetTodos();
        res.status(200).send({
            ActionType:"OK",
            data:result,
            code:200,
        })
    },
    UpdateTodos:async (req,res)=>{
        const {_id} = req.body;
        await FunctionService.UpdateTodos({_id})
        res.status(200).send({
            ActionType:"OK",
            code:200,
        })
    },
    DeleteTodos:async (req,res)=>{
        const {_id} = req.body;
        await FunctionService.DeleteTodos({_id})
        res.status(200).send({
            ActionType:"OK",
            code:200,
        })  
    }
}
module.exports = FunctionController;
