var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const JWT = require('./MiddleWares/jwt');
var indexRouter = require('./routes/index');
const UserRouter = require('./routes/admin/UserRouter');
const NewsRouter = require('./routes/admin/NewsRouter');
const WebNewsRouter = require('./routes/web/NewsRouter');
const AdminExamRouter = require('./routes/admin/ExamRouter');
const WebUserExamRouter = require('./routes/web/ExamRouter');
const AdminLLMRouter = require('./routes/admin/LLMRouter');
const WebLLMRouter = require('./routes/web/LLMRouter');
const FunctionRouter = require('./routes/admin/FunctionRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");  // 允许所有域名访问
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );  // 允许的请求头
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // 允许的HTTP方法
  next();
});

app.use('/', indexRouter);
app.use('/users',UserRouter)
app.use(WebNewsRouter)
app.use(WebUserExamRouter)
app.use(WebLLMRouter)
app.use(FunctionRouter)


/*
adminapi===后台
webapi===前台
*/
app.use((req,res,next)=>{
  //token有效，next()
  //token过期返回401
  if(req.url === "/adminapi/user/login"){
    next()
    return;
  }
  const token = req.headers["authorization"].split(" ")[1]
  if(token){
    var payload = JWT.verify(token)
    if(payload){
      const newToken = JWT.generate({
        _id:payload._id,
        username:payload.username
      },"3d")   
      res.header('Authorization',newToken)
      next()
    }else{
      res.status(401).send({errCode:"-1",errInfo:"token过期"})
    }
  }

})
app.use(UserRouter);
app.use(NewsRouter)
app.use(AdminExamRouter)
app.use(AdminLLMRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
