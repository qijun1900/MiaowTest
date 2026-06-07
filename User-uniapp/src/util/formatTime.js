import moment  from "moment"
moment.locale("zh-cn")
const formatTime = {
    getTodayDate: () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    getTime:(date)=>{
        return moment(date).format('LLL');
    },
    getTime2:(date)=>{
        return moment(date).format('L');
    },
    getRelativeTime:(date)=>{
        const time = Number(new Date(date).getTime())
        if (!time) return "刚刚"

        const diff = Date.now() - time
        if (diff < 60 * 1000) return "刚刚"
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
        if (diff < 24 * 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
        }
        if (diff < 48 * 60 * 60 * 1000) return "昨天"
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
    },
    /** 会话列表时间：今天显示 HH:mm，昨天显示"昨天"，7天内"N天前"，否则 MM-DD */
    formatChatTime:(dateStr)=>{
        if (!dateStr) return ""
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays === 0) {
            const h = date.getHours().toString().padStart(2, "0")
            const m = date.getMinutes().toString().padStart(2, "0")
            return `${h}:${m}`
        }
        if (diffDays === 1) return "昨天"
        if (diffDays < 7) return `${diffDays}天前`
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const day = date.getDate().toString().padStart(2, "0")
        return `${month}-${day}`
    }
}

export default formatTime