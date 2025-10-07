# 云托管部署问题解决方案

## 问题分析

根据部署日志，主要问题是：

1. **数据库连接失败**：应用尝试连接本地MongoDB (`127.0.0.1:27017`)，但云托管环境没有本地MongoDB服务
2. **健康检查失败**：由于数据库连接失败，应用无法正常启动，导致云平台的健康检查失败
3. **监听地址错误**：应用可能没有监听 `0.0.0.0` 而是监听 `localhost`

## 解决方案

### 1. 环境变量配置

在云托管平台设置以下环境变量：

```bash
# 基础配置
NODE_ENV=production
PORT=3000
MONGO_PROVIDER=cloud

# 云数据库连接配置
MONGO_CLOUD_HOST=47.95.37.174
MONGO_CLOUD_PORT=27017
MONGO_CLOUD_USERNAME=mongo_cG37de
MONGO_CLOUD_PASSWORD=mongo_FG2M6e
MONGO_CLOUD_DATABASE=examinationsystem
MONGO_CLOUD_AUTH_SOURCE=admin

# 微信小程序配置
WECHAT_APPID=wx4f6ba6075c1d2a31
WECHAT_SECRET=dfcb1748945aad840b5bae683fe75017

# JWT和Session密钥（生产环境请使用随机密钥）
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# API密钥
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

### 2. 确保外部数据库可访问

确认以下事项：
- MongoDB服务器 `47.95.37.174:27017` 正在运行
- 防火墙允许云托管服务器访问MongoDB端口
- MongoDB用户权限配置正确

### 3. 健康检查配置

云托管平台健康检查设置：
- **健康检查路径**：`/health`
- **启动等待时间**：至少 60 秒
- **检查间隔**：6h
- **超时时间**：10 秒
- **重试次数**：3 次

### 4. 应用修改说明

已修改的文件：

#### `db/db.enhanced.js`
- 增强了云数据库连接配置
- 添加了环境变量检查和错误诊断
- 支持配置文件降级方案

#### `bin/www`
- 增加了云托管环境自动检测
- 应用自动监听 `0.0.0.0` 而非 `localhost`
- 增强了启动日志和错误诊断信息
- 添加了环境变量验证

#### `Dockerfile`
- 设置了云托管环境变量
- 优化了容器配置

### 5. 部署验证

部署后验证以下项目：

1. **环境变量检查**
   ```bash
   # 查看应用启动日志，确认环境变量正确加载
   ```

2. **数据库连接测试**
   ```bash
   # 启动日志应显示：
   # ? 数据库连接成功
   ```

3. **健康检查测试**
   ```bash
   curl https://your-app-url/health
   # 应返回：{"status":"ok","database":"connected",...}
   ```

### 6. 常见问题排查

#### 问题：仍然连接本地数据库
**解决**：确认环境变量 `MONGO_PROVIDER=cloud` 已正确设置

#### 问题：云数据库连接超时
**解决**：
1. 检查网络连通性
2. 确认MongoDB服务状态
3. 验证用户名密码

#### 问题：健康检查仍然失败
**解决**：
1. 检查应用是否监听 `0.0.0.0:3000`
2. 确认 `/health` 端点可访问
3. 增加健康检查等待时间

### 7. 监控和日志

应用启动成功后，日志应显示：
```
========================================
? 答题系统正在启动...
========================================
环境: production
运行环境: 云托管
数据库提供商: 云数据库
开发模式: 关闭

? 云数据库环境变量检查:
   MONGO_CLOUD_HOST: ?
   MONGO_CLOUD_USERNAME: ?
   MONGO_CLOUD_PASSWORD: ?
   MONGO_CLOUD_DATABASE: examinationsystem

? 正在连接数据库...
?? 使用云数据库环境变量连接
? 数据库连接成功

========================================
? 服务器启动成功！
========================================
? 监听地址: 0.0.0.0:3000
? 云托管地址: 由平台分配
? 健康检查: /health
? 数据库状态: ? 健康
??  云托管模式: 已优化配置
========================================
```

## 注意事项

1. **安全性**：生产环境中的JWT_SECRET和SESSION_SECRET应使用强随机密钥
2. **数据库安全**：确保MongoDB访问权限配置正确
3. **日志监控**：定期检查应用和数据库连接状态
4. **备份策略**：确保数据库有适当的备份机制