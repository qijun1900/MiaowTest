const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    gender:Number,//性别,0,1,2
    introduction:String,
    avatar:String,
    role:Number,//管理员1，编辑2
    state:Number,//状态，0:禁用，1:正常，
    createTime:Date,
})

const UserModel  = mongoose.model("user",UserSchema)

module.exports = UserModel