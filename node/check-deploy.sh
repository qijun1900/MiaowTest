#!/bin/bash

# 答题系统部署检查脚本
# 检查部署环境和配置文件

echo "=========================================="
echo "        答题系统部署环境检查"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}?${NC} $1 存在"
        return 0
    else
        echo -e "${RED}?${NC} $1 不存在"
        return 1
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}?${NC} $1 已安装"
        return 0
    else
        echo -e "${RED}?${NC} $1 未安装"
        return 1
    fi
}

# 检查必要工具
echo -e "\n${YELLOW}检查必要工具:${NC}"
check_command "docker"
check_command "docker-compose" || check_command "docker compose"
check_command "node"
check_command "npm"

# 检查项目文件
echo -e "\n${YELLOW}检查项目文件:${NC}"
check_file "package.json"  
check_file "app.js"
check_file "bin/www.cloud"
check_file "db/db.enhanced.js"

# 检查部署文件
echo -e "\n${YELLOW}检查部署文件:${NC}"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file ".dockerignore"
check_file ".env.example"
check_file "DEPLOY.md"

# 检查配置文件
echo -e "\n${YELLOW}检查配置文件:${NC}"
check_file "config/db.config.js"
check_file "config/1panelmongo.config.js"

# 检查环境变量文件
echo -e "\n${YELLOW}检查环境配置:${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}?${NC} .env 文件存在"
    echo -e "${YELLOW}环境变量检查:${NC}"
    
    # 检查必要的环境变量
    required_vars=("MONGO_USERNAME" "MONGO_PASSWORD" "MONGO_DATABASE")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            echo -e "${GREEN}?${NC} $var 已配置"
        else
            echo -e "${RED}?${NC} $var 未配置"
        fi
    done
else
    echo -e "${YELLOW}!${NC} .env 文件不存在，请复制 .env.example 并配置"
fi

# 检查端口占用
echo -e "\n${YELLOW}检查端口占用:${NC}"
if netstat -tuln | grep -q ":3000 "; then
    echo -e "${YELLOW}!${NC} 端口 3000 已被占用"
else
    echo -e "${GREEN}?${NC} 端口 3000 可用"
fi

if netstat -tuln | grep -q ":27017 "; then
    echo -e "${YELLOW}!${NC} 端口 27017 已被占用"
else
    echo -e "${GREEN}?${NC} 端口 27017 可用"
fi

# 检查Docker服务
echo -e "\n${YELLOW}检查Docker服务:${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}?${NC} Docker 服务运行正常"
else
    echo -e "${RED}?${NC} Docker 服务未运行或权限不足"
fi

# 检查磁盘空间
echo -e "\n${YELLOW}检查磁盘空间:${NC}"
available_space=$(df . | awk 'NR==2 {print $4}')
if [ "$available_space" -gt 1048576 ]; then  # 1GB = 1048576 KB
    echo -e "${GREEN}?${NC} 磁盘空间充足 ($(df -h . | awk 'NR==2 {print $4}') 可用)"
else
    echo -e "${YELLOW}!${NC} 磁盘空间不足，建议至少预留1GB空间"
fi

echo -e "\n=========================================="
echo -e "检查完成！请根据以上结果修复问题后再进行部署。"
echo -e "\n快速部署命令:"
echo -e "${GREEN}cp .env.example .env${NC}  # 复制环境变量模板"
echo -e "${GREEN}# 编辑 .env 文件配置数据库密码等${NC}"
echo -e "${GREEN}docker-compose up -d${NC}  # 启动服务"
echo "=========================================="