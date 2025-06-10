const LLMService = require("../../services/admin/LLMService");

const LLMController = {
    addmodel: async (req, res) => {
        const { modelName, modelValue ,isPublish} = req.body;
        await LLMService.addmodel({ 
            modelName, 
            modelValue,
            isPublish,
            editTime:new Date()
         })
        res.send({
            code: 200,
            mActionType: "OK", 
        })
        
    },
    getmodellist: async (req, res) => {
        const result = await LLMService.getmodel()
        res.send({
            code: 200,
            mActionType: "OK",
            data: result
        })
    },
    updatempdelinfo: async (req, res) => {
        const { modelName, modelValue,_id} = req.body;
        await LLMService.updatempdelinfo({ modelName, modelValue,_id })
        res.send({
            code: 200,
            mActionType: "OK",
        })
    },
    deletemodel: async (req, res) => {
        const {id} = req.params;
        await LLMService.deletemodel({_id:id})
        res.send({
            code: 200,
            mActionType: "OK", 
        })
    },
    changestatus: async (req, res) => {
        const {_id,isPublish} = req.body;
        await LLMService.changestatus({_id,isPublish})
        res.send({
            code: 200,
            mActionType: "OK",
        })
    }
}

module.exports = LLMController