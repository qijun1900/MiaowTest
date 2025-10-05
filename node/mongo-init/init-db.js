// MongoDB ��ʼ���ű�
// �������ݿ�ͳ�ʼ�û�

// �л���Ŀ�����ݿ�
db = db.getSiblingDB('examinationsystem');

// ����Ӧ���û� (���������)
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
  print('Ӧ���û������ɹ�');
} catch (e) {
  if (e.code === 11000) {
    print('Ӧ���û��Ѵ���');
  } else {
    print('����Ӧ���û�ʧ��: ' + e.message);
  }
}

// �����������Ϻ�����
try {
  // �û�����
  db.createCollection('users');
  db.users.createIndex({ username: 1 }, { unique: true });
  db.users.createIndex({ email: 1 }, { sparse: true });
  
  // ���Լ���
  db.createCollection('exams');
  db.exams.createIndex({ title: 1 });
  db.exams.createIndex({ createTime: -1 });
  
  // ��Ŀ����
  db.createCollection('questions');
  db.questions.createIndex({ type: 1 });
  db.questions.createIndex({ examId: 1 });
  
  // �û����Լ�¼����
  db.createCollection('userexams');
  db.userexams.createIndex({ userId: 1, examId: 1 });
  db.userexams.createIndex({ createTime: -1 });
  
  // ���ż���
  db.createCollection('news');
  db.news.createIndex({ createTime: -1 });
  
  print('�������Ϻ����������ɹ�');
} catch (e) {
  print('�������ϻ�����ʱ����: ' + e.message);
}

print('���ݿ��ʼ�����');