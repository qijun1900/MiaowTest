import moment  from "moment"
moment.locale("zh-cn")
const formatTime = {
    getTime:(date)=>{
        return moment(date).format('LLL');
    },
    getTime2:(date)=>{
        return moment(date).format('L');
        
    }
}

export default formatTime