# 答题系统 Docker 部署指南

## Docker 镜像构建说明

### Dockerfile 特性
本项目的 Dockerfile 采用多层构建优化和安全最佳实践：

#### 🏗️ **构建优化**
- **分层缓存**: 优先复制 package.json，利用 Docker 缓存层
- **轻量级基础镜像**: 使用 Node.js 18 Alpine，镜像体积小
- **依赖优化**: 使用 `npm ci --only=production` 确保依赖一致性
- **缓存清理**: 构建后清理 npm 缓存减小镜像体积

#### 🔒 **安全配置**
- **非 root 用户**: 创建专用的 nodejs 用户运行应用
- **固定用户ID**: 使用固定的 UID/GID (1001) 确保一致性
- **最小权限**: 设置适当的文件权限 (755)
- **安全扫描**: 支持主流安全扫描工具

#### 💊 **健康检查**
- **自动检测**: 每30秒检查应用健康状态
- **灵活配置**: 支持自定义端口和健康检查路径
- **容错机制**: 3次重试机制，防止偶然失败
- **超时控制**: 10秒检查超时，40秒启动缓冲期

#### 🔧 **构建测试**
```bash
# 运行构建测试脚本
chmod +x test-docker.sh
./test-docker.sh

# 手动构建测试
docker build -t exam-system-api .
```

## 文件结构

项目根目录包含以下文件：

- `Dockerfile`: Docker 构建文件
- `.dockerignore`: Docker 构建时忽略的文件
- `docker-compose.yml`: Docker Compose 配置文件
- `.env.example`: 环境变量示例
- `check-deploy.sh`: 部署前检查脚本
- `mongo-init/init-db.js`: MongoDB 初始化脚本
- `DEPLOY.md`: 部署说明文档

## 部署前准备

请确保已安装 Docker 和 Docker Compose
```
# Linux/Mac
chmod +x check-deploy.sh
./check-deploy.sh

# Windows (使用 Git Bash 或 WSL)
bash check-deploy.sh
```

## 部署方式

### 1. 复制环境变量文件

复制 `.env.example` 文件
```
cp .env.example .env
```

编辑 `.env` 文件修改对应值
```
# 数据库配置
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password_here
MONGO_DATABASE=examinationsystem

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# JWT 密钥配置（随机字符串）
JWT_SECRET=your_random_jwt_secret_key
```

### 2. 使用 Docker Compose 部署

```
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f mongodb
```

### 3. 手动部署应用

仅需要配置对应值，不需要外部 MongoDB
```
# 构建应用
docker build -t exam-system-app .

# 手动部署应用，不需要外部 MongoDB
docker run -d \
  --name exam-system-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGO_HOST=your_mongodb_host \
  -e MONGO_PORT=27017 \
  -e MONGO_USERNAME=your_username \
  -e MONGO_PASSWORD=your_password \
  -e MONGO_DATABASE=examinationsystem \
  -e MONGO_PROVIDER=1panel \
  exam-system-app
```

## 访问地址

部署成功后
- 应用地址：http://localhost:3000
- 健康检查：http://localhost:3000/health
- MongoDB：localhost:27017

## 数据持久化

MongoDB 数据持久化到 Docker 的 `mongodb_data` 卷，防止数据丢失

## 停止服务

```
# 停止服务
docker-compose down

# 停止服务并删除数据卷（谨慎使用）
docker-compose down -v
```

## 部署优化

1. **全局优化**：
   - 修改默认配置
   - 使用 HTTPS
   - 加密通信

2. **性能优化**：
   - 优化 MongoDB 配置
   - 使用反向代理 Nginx
   - 日志轮转

3. **安全**：
   - 配置防火墙
   - 日志存储
   - 资源限制

## 常见问题

### 1. 数据库连接失败
检查数据库配置是否正确

### 2. 端口冲突
修改 `docker-compose.yml` 中的端口配置。

### 3. 权限问题
确保 Docker 有足够的权限读写文件

### 4. 内存限制
调整 Docker 内存限制以适应系统内存

## 开发模式

```
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产模式构建
npm run prod
```

## 数据库支持

项目支持以下数据库模式：
- `local`: 本地 MongoDB（默认）
- `1panel`: 1Panel 部署
- `cloud`: 云数据库

通过设置 `MONGO_PROVIDER` 环境变量选择对应模式

## 统一启动文件说明

本项目已统一使用 `bin/www` 启动文件，支持：

### 功能特性
- **自动环境检测**：根据 `NODE_ENV` 环境变量自动适配开发/生产模式
- **统一数据库连接**：使用 `db.enhanced.js` 增强版数据库管理器
- **优雅关闭**：支持 SIGTERM/SIGINT 信号监听和资源清理
- **健康检查**：内置数据库状态监控和显示
- **错误处理**：完善的异常捕获和日志输出
- **美化显示**：丰富的启动信息和状态显示

### 启动方式
```
# 开发模式（默认）
NODE_ENV=development npm start

# 生产模式
NODE_ENV=production npm run prod

# Docker 容器中
NODE_ENV=production node bin/www
```

### 环境变量支持
- `NODE_ENV`: 运行环境 (development/production)
- `PORT`: 服务端口 (默认 3000)
- `MONGO_PROVIDER`: 数据库提供商 (local/1panel/cloud)
- 其他数据库相关环境变量见 `.env.example`
