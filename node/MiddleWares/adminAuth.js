const JWT = require('./jwt');

const adminAuth = (req, res, next) => {
  // 登录接口不验证token
  if (req.url === "/adminapi/user/login") {
    next();
    return;
  }

  // 获取 authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).send({ errCode: "-1", errInfo: "token为空" });
  }

  const token = authHeader.split(" ")[1];
  if (token) {
    const payload = JWT.verify(token);
    if (payload) {
      // 生成新的token，有效期3d (保留原有逻辑)
      const newToken = JWT.generate({
        _id: payload._id,
        username: payload.username
      }, "3d");
      res.header('Authorization', newToken); // 将新的token返回给客户端
      next();
    } else {
      res.status(401).send({ errCode: "-1", errInfo: "token过期" });
    }
  } else {
    res.status(401).send({ errCode: "-1", errInfo: "token为空" });
  }
};

module.exports = adminAuth;
