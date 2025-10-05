#!/bin/bash

# ===============================================
# Docker �����Ͳ��Խű�
# ������֤ Dockerfile ����ȷ�Ժ͹���
# ===============================================

set -e  # �������������˳�

echo "=========================================="
echo "? ����ϵͳ Docker ��������"
echo "=========================================="

# ��ɫ����
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# �������ƺͱ�ǩ
IMAGE_NAME="exam-system-api"
TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${TAG}"

# ��� Docker �Ƿ�����
echo -e "\n${BLUE}? ��� Docker ����...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}? Docker ����δ���У��������� Docker${NC}"
    exit 1
fi
echo -e "${GREEN}? Docker ������������${NC}"

# ��������
echo -e "\n${BLUE}? ���� Docker ����...${NC}"
echo -e "${YELLOW}��������: ${FULL_IMAGE}${NC}"

if docker build -t "$FULL_IMAGE" .; then
    echo -e "${GREEN}? ���񹹽��ɹ�${NC}"
else
    echo -e "${RED}? ���񹹽�ʧ��${NC}"
    exit 1
fi

# ��ʾ������Ϣ
echo -e "\n${BLUE}? ������Ϣ:${NC}"
docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# ��龵��ȫ��
echo -e "\n${BLUE}? ��龵��ȫ��...${NC}"
if command -v docker &> /dev/null; then
    # ����Ƿ��Է�root�û�����
    USER_INFO=$(docker run --rm "$FULL_IMAGE" whoami)
    if [ "$USER_INFO" = "nodejs" ]; then
        echo -e "${GREEN}? ��ȫ���ͨ��: ʹ�÷�root�û� ($USER_INFO)${NC}"
    else
        echo -e "${YELLOW}??  ����: ��ǰ�û�Ϊ $USER_INFO${NC}"
    fi
fi

# �������������������Ծ��������ԣ���������������
echo -e "\n${BLUE}? ������������...${NC}"
if docker run --rm "$FULL_IMAGE" node --version; then
    echo -e "${GREEN}? Node.js ��������${NC}"
else
    echo -e "${RED}? Node.js �����쳣${NC}"
fi

# ���Ӧ���ļ�
echo -e "\n${BLUE}? ���Ӧ���ļ��ṹ...${NC}"
docker run --rm "$FULL_IMAGE" ls -la /app/ | head -10

# ��ʾ���������Ϣ
echo -e "\n=========================================="
echo -e "${GREEN}? Docker ����������ɣ�${NC}"
echo "=========================================="
echo -e "${BLUE}ʹ������������������:${NC}"
echo ""
echo -e "${YELLOW}# ��������${NC}"
echo "docker run -d --name exam-system -p 3000:3000 $FULL_IMAGE"
echo ""
echo -e "${YELLOW}# ʹ�� docker-compose �������Ƽ���${NC}"
echo "docker-compose up -d"
echo ""
echo -e "${YELLOW}# �鿴������־${NC}"
echo "docker logs -f exam-system"
echo ""
echo -e "${YELLOW}# �������${NC}"
echo "curl http://localhost:3000/health"
echo "=========================================="