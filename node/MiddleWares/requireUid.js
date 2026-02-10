/**
 * 验证用户UID是否存在的中间件
 * 用于替代在Controller中重复的UID检查逻辑
 */
const requireUid = (req, res, next) => {
    // 确保 req.user 存在 (通常由 JWT 中间件设置)
    if (!req.user || !req.user.uid) {
        return res.send({
            code: 401,
            message: '您未登录'
        });
    }
    next();
};

module.exports = requireUid;
