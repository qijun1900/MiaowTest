import moment  from "moment"
moment.locale("zh-cn")
const formatTime = {
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
    }
}

export default formatTime