//信息过滤：只保留最后一个用户消息，用于单次对话和模型应用场景。
function filterLastUserMessage(messages) {
    return (messages || [])
        .filter(msg => !msg.isLoading)
        .filter(msg => msg.role === 'user')
        .slice(-1)
        .map(msg => ({
            role: msg.role,
            content: msg.content
        }));
}

module.exports = { filterLastUserMessage };