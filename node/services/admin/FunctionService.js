const TodosModel = require("../../models/TodosModel");
const FunctionService = {
    AddTodos: async ({title}) => {
        return await TodosModel.create({title});
    },
    GetTodos: async () => {
        return await TodosModel.find();
    },
    UpdateTodos: async ({_id}) => {
        return await TodosModel.updateOne({_id},{completed:true});
    },
    DeleteTodos: async ({_id}) => {
        return await TodosModel.deleteOne({_id});
    }
}
module.exports = FunctionService;
