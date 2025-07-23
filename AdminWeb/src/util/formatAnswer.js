// 格式化选择题答案
export const formatSelectAnswer = (options) => {
  return options
    .map((opt, index) => ({ opt, index }))  // 保留原始索引
    .filter(item => item.opt.isCorrect)     // 筛选正确选项
    .map(item => String.fromCharCode(65 + item.index)) // 转字母
    .join(', ');                            // 逗号分隔
};
//判断是否为AI答案
export const isAianswer = (value) => {
  const isAIanswer = {
    0: '否',
    1: '是'
  }
  return isAIanswer[value]
}

