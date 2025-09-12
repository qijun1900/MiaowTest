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
    } catch (error) {
        console.error('Error fetching formatQuestion details:', error);
    }
}