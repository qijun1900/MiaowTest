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
    testChatModel: async (req, res) => {
        const {message,model} = req.body;
        const result = await LLMService.testChatModel(message,model)
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
    }
}

module.exports = LLMController