const mongoose = require('mongoose')

const llmSchema  = new mongoose.Schema({
    modelName:String,
    modelValue:String,
    isPublish:Number,//0:未发布，1：发布
    editTime:Date,
})

const LLMModel    = mongoose.model("llm",llmSchema )

module.exports = LLMModel