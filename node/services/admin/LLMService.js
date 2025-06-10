const LLMModel = require("../../models/LLMsModel");
const LLMService = {
    addmodel: async ({modelName,modelValue,isPublish,editTime}) => {
        return await LLMModel.create({
            modelName,
            modelValue,
            isPublish,
            editTime
        })
    },
    getmodel: async () => {
        return await LLMModel.find({})
    },
    updatempdelinfo: async ({modelName,modelValue,_id}) => {
        return await LLMModel.updateOne({_id},{modelName,modelValue})
    },
    deletemodel: async ({_id}) => {
        return await LLMModel.deleteOne({_id})
    },
    changestatus: async ({_id,isPublish,editTime}) => {
        return await LLMModel.updateOne({_id},{isPublish,editTime})
    }
    

}
module.exports = LLMService