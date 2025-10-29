const formatInfo = {
    getTypeText: (type) => {
        const typeMap = {
            1: '系统反馈',
            2: '题目反馈',
            3: '功能建议',
            4: '其他'
        }
        return typeMap[type] || '未知'
    },

    getTypeTagType: (type) => {
        const typeMap = {
            1: 'danger',
            2: 'warning',
            3: 'success',
            4: 'info'
        }
        return typeMap[type] || 'info'
    },

    getStatusText: (status) => {
        const statusMap = {
            0: '待处理',
            1: '处理中',
            2: '已处理'
        }
        return statusMap[status] || '未知'
    },

    getStatusTagType: (status) => {
        const statusMap = {
            0: 'danger',
            1: 'warning',
            2: 'success'
        }
        return statusMap[status] || 'info'
    }
}
export default formatInfo