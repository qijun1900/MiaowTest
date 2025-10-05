// MongoDB 初始化脚本
// 创建数据库和初始用户

// 切换到目标数据库
db = db.getSiblingDB('examinationsystem');

// 创建应用用户 (如果不存在)
try {
  db.createUser({
    user: 'app_user',
    pwd: 'app_password',
    roles: [
      {
        role: 'readWrite',
        db: 'examinationsystem'
      }
    ]
  });
  print('应用用户创建成功');
} catch (e) {
  if (e.code === 11000) {
    print('应用用户已存在');
  } else {
    print('创建应用用户失败: ' + e.message);
  }
}

// 创建基础集合和索引
try {
  // 用户集合
  db.createCollection('users');
  db.users.createIndex({ username: 1 }, { unique: true });
  db.users.createIndex({ email: 1 }, { sparse: true });
  
  // 考试集合
  db.createCollection('exams');
  db.exams.createIndex({ title: 1 });
  db.exams.createIndex({ createTime: -1 });
  
  // 题目集合
  db.createCollection('questions');
  db.questions.createIndex({ type: 1 });
  db.questions.createIndex({ examId: 1 });
  
  // 用户考试记录集合
  db.createCollection('userexams');
  db.userexams.createIndex({ userId: 1, examId: 1 });
  db.userexams.createIndex({ createTime: -1 });
  
  // 新闻集合
  db.createCollection('news');
  db.news.createIndex({ createTime: -1 });
  
  print('基础集合和索引创建成功');
} catch (e) {
  print('创建集合或索引时出错: ' + e.message);
}

print('数据库初始化完成');