export default function formatQuestion(questionData) {
    try {
        if (questionData.Type === 1) {
            const options = questionData.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                return `${optionLetter}: ${option.content}`;
            });
            const correctAnswers = questionData.options
                .map((option, index) => option.isCorrect ? String.fromCharCode(65 + index) : null)
                .filter(Boolean);
            return `${questionData.stem}\n${options.join('\n')}\n答案:${correctAnswers.join(',')}`;
        }
        else if (questionData.Type === 2) {
            const blanks = questionData.options.map((blank, index) => {
                return `空${index + 1}: ${blank.content}`;
            })
            return `${questionData.stem}\n${blanks.join('\n')}`;
        }
        else if (questionData.Type === 3) {
            const correctAnswer = questionData.answer === 1? "正确" : "错误";
            return `${questionData.stem}\n答案:${correctAnswer}`;
        }
        else if (questionData.Type === 4) {
            return `${questionData.stem}\n答案:${questionData.content}`;
        }
    } catch (error) {
        console.error('Error fetching formatQuestion details:', error);
    }
}