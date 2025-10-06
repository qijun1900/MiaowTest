# ===========================================
# 答题系统后端服务 Dockerfile
# 基于 Node.js 18 Alpine 构建轻量级生产镜像
# ===========================================

# 使用官方 Node.js 18 Alpine 作为基础镜像
# Alpine Linux 体积小，安全性高，适合生产环境
FROM node:18-alpine

# 设置镜像元数据
LABEL maintainer="答题系统"
LABEL description="答题系统后端API服务"
LABEL version="1.0.0"

# 设置工作目录
# 所有后续命令都在此目录下执行
WORKDIR /app

# 优化：先复制 package 文件，利用 Docker 缓存层
# 只有当 package.json 或 package-lock.json 改变时才会重新安装依赖
COPY package*.json ./

# 安装生产环境依赖
# 使用 npm ci 确保依赖版本一致性，比 npm install 更快更可靠
# --only=production 仅安装生产环境依赖，减小镜像体积
RUN npm ci --only=production && \
    npm cache clean --force

# 复制应用源代码
# 利用 .dockerignore 排除不必要的文件
COPY . .

# 创建非 root 用户运行应用（安全最佳实践）
# 使用固定的用户ID和组ID确保一致性
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 创建必要的目录并设置正确的文件权限
# logs: 应用日志存储目录
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# 切换到非特权用户
# 提高容器安全性，防止潜在的权限提升攻击
USER nodejs

# 暴露应用端口
# 默认端口 3000，可通过环境变量 PORT 覆盖
EXPOSE 3000

# 配置健康检查
# 定期检查应用是否正常运行，支持容器编排系统的健康监控
# --interval: 检查间隔时间（6小时）
# --timeout: 单次检查超时时间
# --start-period: 容器启动后等待时间
# --retries: 失败重试次数
HEALTHCHECK --interval=6h --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { \
      host: 'localhost', \
      port: process.env.PORT || 3000, \
      path: '/health', \
      timeout: 8000 \
    }; \
    const req = http.request(options, (res) => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# 设置默认环境变量
# 生产环境配置
ENV NODE_ENV=production
ENV PORT=3000
ENV MONGO_PROVIDER=cloud

# 云托管环境标识
ENV CONTAINER_NAME=answer-system

# 启动应用
# 使用统一的启动文件，支持多环境配置
CMD ["node", "bin/www"]