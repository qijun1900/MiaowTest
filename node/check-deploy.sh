#!/bin/bash

# ����ϵͳ������ű�
# ��鲿�𻷾��������ļ�

echo "=========================================="
echo "        ����ϵͳ���𻷾����"
echo "=========================================="

# ��ɫ����
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ��麯��
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}?${NC} $1 ����"
        return 0
    else
        echo -e "${RED}?${NC} $1 ������"
        return 1
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}?${NC} $1 �Ѱ�װ"
        return 0
    else
        echo -e "${RED}?${NC} $1 δ��װ"
        return 1
    fi
}

# ����Ҫ����
echo -e "\n${YELLOW}����Ҫ����:${NC}"
check_command "docker"
check_command "docker-compose" || check_command "docker compose"
check_command "node"
check_command "npm"

# �����Ŀ�ļ�
echo -e "\n${YELLOW}�����Ŀ�ļ�:${NC}"
check_file "package.json"  
check_file "app.js"
check_file "bin/www.cloud"
check_file "db/db.enhanced.js"

# ��鲿���ļ�
echo -e "\n${YELLOW}��鲿���ļ�:${NC}"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file ".dockerignore"
check_file ".env.example"
check_file "DEPLOY.md"

# ��������ļ�
echo -e "\n${YELLOW}��������ļ�:${NC}"
check_file "config/db.config.js"
check_file "config/1panelmongo.config.js"

# ��黷�������ļ�
echo -e "\n${YELLOW}��黷������:${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}?${NC} .env �ļ�����"
    echo -e "${YELLOW}�����������:${NC}"
    
    # ����Ҫ�Ļ�������
    required_vars=("MONGO_USERNAME" "MONGO_PASSWORD" "MONGO_DATABASE")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            echo -e "${GREEN}?${NC} $var ������"
        else
            echo -e "${RED}?${NC} $var δ����"
        fi
    done
else
    echo -e "${YELLOW}!${NC} .env �ļ������ڣ��븴�� .env.example ������"
fi

# ���˿�ռ��
echo -e "\n${YELLOW}���˿�ռ��:${NC}"
if netstat -tuln | grep -q ":3000 "; then
    echo -e "${YELLOW}!${NC} �˿� 3000 �ѱ�ռ��"
else
    echo -e "${GREEN}?${NC} �˿� 3000 ����"
fi

if netstat -tuln | grep -q ":27017 "; then
    echo -e "${YELLOW}!${NC} �˿� 27017 �ѱ�ռ��"
else
    echo -e "${GREEN}?${NC} �˿� 27017 ����"
fi

# ���Docker����
echo -e "\n${YELLOW}���Docker����:${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}?${NC} Docker ������������"
else
    echo -e "${RED}?${NC} Docker ����δ���л�Ȩ�޲���"
fi

# �����̿ռ�
echo -e "\n${YELLOW}�����̿ռ�:${NC}"
available_space=$(df . | awk 'NR==2 {print $4}')
if [ "$available_space" -gt 1048576 ]; then  # 1GB = 1048576 KB
    echo -e "${GREEN}?${NC} ���̿ռ���� ($(df -h . | awk 'NR==2 {print $4}') ����)"
else
    echo -e "${YELLOW}!${NC} ���̿ռ䲻�㣬��������Ԥ��1GB�ռ�"
fi

echo -e "\n=========================================="
echo -e "�����ɣ���������Ͻ���޸�������ٽ��в���"
echo -e "\n���ٲ�������:"
echo -e "${GREEN}cp .env.example .env${NC}  # ���ƻ�������ģ��"
echo -e "${GREEN}# �༭ .env �ļ��������ݿ������${NC}"
echo -e "${GREEN}docker-compose up -d${NC}  # ��������"
echo "=========================================="