const mongoose = require('mongoose');
const UserModel = require('./models/UserModel');
const config = require('./config/db.config')// 导入数据库配置(本地)

mongoose.connect(`mongodb://${config.DBHOST}:${config.DBPORT}/${config.DBNAME}`);

// 增加连接状态检查
const checkDbConnection = () => {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connecting', 'connected', 'disconnecting'];
  console.log('当前数据库状态:', states[state]);
  return state === 1;
};

// 管理员账户信息
const adminUser = {
  username: 'admin',
  password: 'admin123', // 建议创建后立即修改密码
  role: 1, // 1表示管理员角色
  gender: 0, // 0表示保密
  introduction: '系统管理员',
  avatar: '' // 可选，默认无头像
};

// 创建管理员账户
async function createAdmin() {
  try {
    // 检查是否已存在同名用户
    const existingUser = await UserModel.findOne({ username: adminUser.username });
    if (existingUser) {
      console.log('管理员账户已存在');
      return;
    }

    // 创建新管理员
    const newUser = await UserModel.create(adminUser);
    console.log('管理员账户创建成功:');
    console.log({ id: newUser._id, username: newUser.username, role: newUser.role });
  } catch (error) {
    console.error('创建管理员账户失败:', error.message);
  } finally {
    // 关闭数据库连接
    mongoose.disconnect();
  }
}

// 执行创建函数
createAdmin();