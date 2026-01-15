require('dotenv').config()
const jsonwebtoken = require('jsonwebtoken');
const secret = process.env.TOKEN_SECRET 
const JWT = {
    generate(value,expires){
       return jsonwebtoken.sign(value,secret,{expiresIn:expires})
    },
    verify(token){
      try{
        return jsonwebtoken.verify(token,secret)
      }catch(e){
        return false
      }
    },
    // Express中间件验证函数
    verifyTokenMiddleware() {
      return (req, res, next) => {
        // 获取请求头中的token
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
          return res.status(401).json({
            code: 401,
            message: '未提供token',
            ActionType: 'ERROR'
          });
        }
        
        // 验证token
        const decoded = JWT.verify(token);
        
        if (!decoded) {
          return res.status(401).json({
            code: 401,
            message: 'token无效',
            ActionType: 'ERROR'
          });
        }
        
        // 将解码后的用户信息添加到请求对象中
        req.user = decoded; 
        next();
      };
    },
    // 可选的JWT验证中间件 - 如果有token则验证，没有token则继续处理
    optionalTokenMiddleware() {
      return (req, res, next) => {
        // 获取请求头中的token
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        
        if (!token) {
          // 没有token，继续处理请求
          return next();
        }
        
        // 有token，尝试验证
        const decoded = JWT.verify(token);
        
        if (decoded) {
          // token有效，将解码后的用户信息添加到请求对象中
          req.user = decoded;
        }
        
        // 无论token是否有效，都继续处理请求
        next();
      };
    }
}

module.exports = JWT