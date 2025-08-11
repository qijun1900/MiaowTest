//1panel MongoDB配置文件,部署上线文件,需要在根目录创建.env文件,并添加以下内容:
require('dotenv').config(); 

module.exports ={
    username: process.env.MONGO_USERNAME ,//用户名
    password: process.env.MONGO_PASSWORD ,//密码
    host: process.env.MONGO_HOST ,// 主机地址
    sport: process.env.MONGO_PORT, // 端口
    databasename: process.env.MONGO_DATABASE ,// 数据库名称
}