const jsonwebtoken = require('jsonwebtoken');
const secret = "qijundawang"
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
    }
}

module.exports = JWT