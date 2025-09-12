const LLMService = require("../../services/admin/LLMService");

const LLMController = {
    addmodel: async (req, res) => {
        const { modelName, modelValue,description,isPublish,creator} = req.body;
        await LLMService.addmodel({ 
            modelName, 
            modelValue,
            isPublish,
            creator,
            description,
            createdTime:new Date()
         })
        res.send({
            code: 200,
            ActionType: "OK", 
        })
        
    },
    getmodellist: async (req, res) => {
        const { page, size } = req.query;
        const result = await LLMService.getmodel({
            page: Number(page),
            size: Number(size)
        })
        res.send({
            code: 200,
            ActionType: "OK",
            data: result
        })
    },
    updateModel: async (req, res) => {
        const {_id, modelName, modelValue,description,creator} = req.body;
        await LLMService.updateModel({
            _id,
            modelName,
            modelValue,
            creator,
            description,
            editTime:new Date()
        })
        res.send({
            code: 200,
            ActionType: "OK",
        })
    },
    deleteOnemodel: async (req, res) => {
        const {_id} = req.body
        await LLMService.deleteOnemodel({_id})
        res.send({
            code: 200,
            ActionType: "OK", 
        })
    },
    deleteManymodel: async (req, res) => {
        const {_ids} = req.body;
        await LLMService.deleteManymodel({_ids})
        res.send({
            code: 200,
            ActionType: "OK",
        })
    },
    changestatus: async (req, res) => {
        const {_id,state} = req.body;
        await LLMService.changestatus({_id,state})
        res.send({
            code: 200,
            ActionType: "OK",
        })
    },
    useLLMChat: async (req, res) => {
        const {message,model} = req.body;
        const result = await LLMService.useLLMChat(message,model)
        res.send({
            code: 200,
            ActionType: "OK",
            data: result
        })
    },
    getChatModels: async (req, res) => {
        const result = await LLMService.getChatModels()
        res.send({
            code: 200,
            ActionType: "OK",
            data: result
        })
    },
    BatchaddQuestion: async (req, res) => {
        const {message,examId,category} = req.body;
        const result = await LLMService.BatchaddQuestion(message,examId,category)
        res.send({
            code: 200,
            ActionType: "OK",
            data: result
        })
    },
    getQuestionAnalysis: async (req, res) => {
        const {message,questionType,_id} = req.body;
        const result = await LLMService.getQuestionAnalysis(message,questionType,_id)
        console.log(result)
        res.send({
            code: 200,
            ActionType: "OK",
            data: result
        })
    }
}

module.exports = LLMController