import moment from "moment"
moment.locale("zh-cn")
const formatTime = {
    getTime: (date) => {
        return moment(date).format('LLL');
    },
    getTime2: (date) => {
        return moment(date).format('L');
    },
    formatTime: (time) => {
        if (!time) return '-'
        const date = new Date(time)
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    },
    formatDate: (date) => {
        if (!date) return '-'
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    }
}

export default formatTime