module.exports = function(success,error){

//导入 mongooes
const mongoose = require('mongoose');

//导入配置文件
const config = require('../config/db.config')

//1panel MongoDB配置文件
const paneldbconfig = require('../config/1panelmongo.config')

    
//连接 mongodb 服务 
mongoose.connect(`mongodb://${config.DBHOST}:${config.DBPORT}/${config.DBNAME}`);//不存在自动创建

//1panel 连接mongodb数据库
// mongoose.connect('mongodb://username:password@host:port/database', {
//     authSource: 'admin' // 关键：指定认证数据库为 admin
//   });
// mongoose.connect(`mongodb://${paneldbconfig.username}:${paneldbconfig.password}@${paneldbconfig.host}:${paneldbconfig.sport}/${paneldbconfig.databasename}`,{authSource: 'admin'})

//4.设置回调, 
mongoose.connection.once('open',()=>{
success()

});//设置连接成功

mongoose.connection.on('close',()=>{
console.log('连接关闭')
})

//关闭mongooes.disconnect()
}