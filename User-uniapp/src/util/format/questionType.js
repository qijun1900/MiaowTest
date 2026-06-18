const formatInfo = {
    getQuestionTypeText: (type) => {
        const typeMap = {
            1: '选择题',
            2: '填空题',
            3: '判断题',
            4: '简答题'
        };
        return typeMap[type] || '未知类型';
    }
};

export default formatInfo;
