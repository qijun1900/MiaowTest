#!/bin/bash

# ===============================================
# Docker 构建和测试脚本
# 用于验证 Dockerfile 的正确性和功能
# ===============================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "? 答题系统 Docker 构建测试"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 镜像名称和标签
IMAGE_NAME="exam-system-api"
TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${TAG}"

# 检查 Docker 是否运行
echo -e "\n${BLUE}? 检查 Docker 环境...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}? Docker 服务未运行，请先启动 Docker${NC}"
    exit 1
fi
echo -e "${GREEN}? Docker 服务正常运行${NC}"

# 构建镜像
echo -e "\n${BLUE}? 构建 Docker 镜像...${NC}"
echo -e "${YELLOW}镜像名称: ${FULL_IMAGE}${NC}"

if docker build -t "$FULL_IMAGE" .; then
    echo -e "${GREEN}? 镜像构建成功${NC}"
else
    echo -e "${RED}? 镜像构建失败${NC}"
    exit 1
fi

# 显示镜像信息
echo -e "\n${BLUE}? 镜像信息:${NC}"
docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# 检查镜像安全性
echo -e "\n${BLUE}? 检查镜像安全性...${NC}"
if command -v docker &> /dev/null; then
    # 检查是否以非root用户运行
    USER_INFO=$(docker run --rm "$FULL_IMAGE" whoami)
    if [ "$USER_INFO" = "nodejs" ]; then
        echo -e "${GREEN}? 安全检查通过: 使用非root用户 ($USER_INFO)${NC}"
    else
        echo -e "${YELLOW}??  警告: 当前用户为 $USER_INFO${NC}"
    fi
fi

# 测试容器启动（仅测试镜像完整性，不启动完整服务）
echo -e "\n${BLUE}? 测试容器启动...${NC}"
if docker run --rm "$FULL_IMAGE" node --version; then
    echo -e "${GREEN}? Node.js 环境正常${NC}"
else
    echo -e "${RED}? Node.js 环境异常${NC}"
fi

# 检查应用文件
echo -e "\n${BLUE}? 检查应用文件结构...${NC}"
docker run --rm "$FULL_IMAGE" ls -la /app/ | head -10

# 显示构建完成信息
echo -e "\n=========================================="
echo -e "${GREEN}? Docker 构建测试完成！${NC}"
echo "=========================================="
echo -e "${BLUE}使用以下命令启动容器:${NC}"
echo ""
echo -e "${YELLOW}# 基本启动${NC}"
echo "docker run -d --name exam-system -p 3000:3000 $FULL_IMAGE"
echo ""
echo -e "${YELLOW}# 使用 docker-compose 启动（推荐）${NC}"
echo "docker-compose up -d"
echo ""
echo -e "${YELLOW}# 查看容器日志${NC}"
echo "docker logs -f exam-system"
echo ""
echo -e "${YELLOW}# 健康检查${NC}"
echo "curl http://localhost:3000/health"
echo "=========================================="