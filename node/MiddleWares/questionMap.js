const QuestionMap = (data, Type) => {
    const prefix = `[${data.题目类型}] ${data.题干}`;
    
    switch(Type) {
        case 1: // 单选题
            return `${prefix} ${data.选项} 正确答案:${data.正确答案}`;
        case 2: // 多选题
            return `${prefix} ${data.填空项}`;
        case 3: // 判断题
            return `${prefix} 正确答案:${data.正确答案}`;
        case 4: // 简答题
            return `${prefix} 参考答案:${data.参考答案}`;
        default:
            return prefix; // 默认返回基础信息
    }
}
module.exports = QuestionMap;