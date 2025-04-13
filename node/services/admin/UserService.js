const UserModel = require('../../models/UserModel')
const UserService={
    login:async({username,password})=>{
      return UserModel.find({
        username,
        password
        }) 
    },
    upload : async({_id,username,introduction,gender,avatar})=>{
      if(avatar){
        return UserModel.updateOne({_id},{
          username,introduction,gender,avatar
        })
      }else{
        return UserModel.updateOne({_id},{
          username,introduction,gender
        })
      }
    },
    add : async({username,introduction,gender,avatar,password,role})=>{
      return UserModel.create({
        username,
        password,
        introduction,
        gender,
        avatar,
        role,
      }) 
    },
    getlist: async ({id})=>{
      return id?UserModel.find({_id:id},["username","introduction","gender","role","password"]):UserModel.find({},["username","introduction","gender","role","avatar"])

    },
    dellist:async ({_id})=>{
      return UserModel.deleteOne({_id})

    },
    putlist: async (body)=>{
      return UserModel.updateOne({_id:body._id},body)
    },
}

module.exports = UserService