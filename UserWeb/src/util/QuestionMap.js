// 选择题映射
const QuestionMap = (questionData) => {
    try {
        if (questionData.Type === 1) {
            const options = questionData.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                return `${optionLetter}: ${option.content}`;
            });
            
            const correctAnswerIndex = questionData.options.findIndex(option => option.isCorrect);
            const correctAnswer = String.fromCharCode(65 + correctAnswerIndex);
            
            return {
                题干: questionData.stem,
                题目类型: "选择题",
                选项: options.join(" "),
                正确答案: correctAnswer,
            };
        }
        
        // 填空题映射
        if (questionData.Type === 2) {
            const blanks = questionData.options.map((blank, index) => {
                return `空${index + 1}: ${blank.content}`;
            });
            
            return {
                题干: questionData.stem,
                题目类型: "填空题",
                填空项: blanks.join(" "),
            };
        }
        // 判断题映射
        if (questionData.Type === 3) {
            const correctAnswer = questionData.answer === 1 ? "正确" : "错误";
            return {
                题干: questionData.stem,
                题目类型: "判断题",
                正确答案: correctAnswer,
            };
        }
        // 简答题映射
        if (questionData.Type === 4) {
           const ReferenceAnswer = questionData.content;
            return {
                题干: questionData.stem,
                题目类型: "简答题",
                参考答案: ReferenceAnswer,
            };
        }
        
    } catch (error) {
        console.error('Error fetching exam details:', error);
        throw error;
    }
}

export default QuestionMap;

