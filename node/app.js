var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const JWT = require('./MiddleWares/jwt');
const clientDetector = require('./MiddleWares/clientDetector');// 引入客户端检测中间件
var indexRouter = require('./routes/index'); // 引入路由模块
const UserRouter = require('./routes/admin/UserRouter'); // 引入Admin用户路由模块
const NewsRouter = require('./routes/admin/NewsRouter'); // 引入Admin新闻路由模块
const WebNewsRouter = require('./routes/user/NewsRouter'); // 引入用户端新闻路由模块
const AdminExamRouter = require('./routes/admin/ExamRouter'); // 引入Admin考试路由模块
const ConsumerExamRouter = require('./routes/user/ExamRouter'); // 引入用户端考试路由模块
const AdminLLMRouter = require('./routes/admin/LLMRouter'); // 引入AdminLLM路由模块
const ConsumerLLMRouter = require('./routes/user/LLMRouter'); // 引入用户端LLM路由模块 
const FunctionRouter = require('./routes/admin/FunctionRouter'); // 引入Admin功能路由模块
const UniUserRouter = require('./routes/user/UserRouter'); // 引入用户端用户路由模块
const AdminConsumerRouter = require('./routes/admin/ConsumerRouter'); // 引入Admin用户端用户路由模块
const WordBooksRouter = require('./routes/admin/WordBooksRouter'); // 引入Admin词书路由模块
const VocabularyRouter = require('./routes/user/VocabularyRouter'); // 引入用户端词汇相关路由模块
const AdminFileRouter = require('./routes/admin/FileRouter'); // 引入Admin资源路由模块

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 静态文件重定向到阿里云 OSS
const ossStaticRedirect = require('./MiddleWares/ossStaticRedirect');
app.use(ossStaticRedirect);
// 保留本地静态文件服务作为 fallback 
app.use(express.static(path.join(__dirname, 'public')));
// CORS跨域资源共享中间件配置
// 用于处理跨域请求，允许前端应用从不同域访问后端API
app.use((req, res, next) => {
  // 设置允许访问的源（Origin），* 表示允许所有域名来源的请求
  // 在生产环境中应该设置为具体的前端域名，如：http://your-frontend-domain.com
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  // 设置允许的请求头信息
  // 这些是客户端在发送请求时可以包含的自定义头部信息
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, source-client, platform, Authorization"
  );// 允许的头部信息
  
  // 设置允许的HTTP请求方法
  // 定义了客户端可以使用的请求方式类型
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  
  // 调用next()将请求传递给下一个中间件处理
  // 这是Express中间件链的标准做法，确保请求继续向下传递
  next();
});
app.use(clientDetector); // 使用客户端检测中间件

// 健康检查路由
app.get('/health', (req, res) => {
  const { dbManager } = require('./db/db.enhanced');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbManager.isHealthy() ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/', indexRouter);
app.use('/users',UserRouter)// 注册用户路由(后台端)
app.use(UniUserRouter)// 注册用户路由(用户端)
app.use(WebNewsRouter)// 注册新闻路由(用户端)
app.use(ConsumerExamRouter)// 注册考试路由(用户端)
app.use(ConsumerLLMRouter)// 注册llm路由(用户端)
app.use(VocabularyRouter)// 注册词汇相关路由(用户端)

/*
adminapi===后台管理接口
*/
app.use((req,res,next)=>{
  //token有效，next()
  //token过期返回401
  if(req.url === "/adminapi/user/login"){//登录接口不验证token
    next()
    return;
  }
  const token = req.headers["authorization"].split(" ")[1]
  if(token){
    var payload = JWT.verify(token)
    if(payload){
      const newToken = JWT.generate({//生成新的token，有效期3d
        _id:payload._id, 
        username:payload.username 
      },"3d")   
      res.header('Authorization',newToken)//将新的token返回给客户端
      next()
    }else{
      res.status(401).send({errCode:"-1",errInfo:"token过期"})
    }
  } else {
    res.status(401).send({errCode:"-1",errInfo:"token为空"});
  }
})
app.use(UserRouter);//用户路由(admin)
app.use(NewsRouter)//信息路由(admin)
app.use(AdminExamRouter)//考试路由(admin)
app.use(AdminLLMRouter)//llm路由(admin)
app.use(FunctionRouter)//功能路由(admin)
app.use(AdminConsumerRouter)//用户路由(admin)
app.use(WordBooksRouter)//词书路由(admin)
app.use(AdminFileRouter)//资源路由(admin)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 返回JSON错误信息而不是渲染页面
  res.status(err.status || 500);
  res.json({
    errCode: '-1',
    errInfo: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;