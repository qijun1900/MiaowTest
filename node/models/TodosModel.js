const mongoose = require('mongoose')

const TodosSchema = new mongoose.Schema({
    title: String,
    createTime: {
        type: Date,
        default: Date.now
    },
    completed: {
        type: Boolean,
        default: false
    }
})

const TodosModel = mongoose.model("todo", TodosSchema)

module.exports = TodosModel