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
    },

    // 获取性别文本
    getGenderText: (gender) => {
        switch (gender) {
            case 0:
                return '未知'
            case 1:
                return '男性'
            case 2:
                return '女性'
            default:
                return '未知'
        }
    },

    // 获取性别标签类型
    getGenderTagType: (gender) => {
        switch (gender) {
            case 0:
                return 'info'
            case 1:
                return 'primary'
            case 2:
                return 'danger'
            default:
                return 'info'
        }
    }
}
export default formatInfo