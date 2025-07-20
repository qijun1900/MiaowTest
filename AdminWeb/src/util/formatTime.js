import moment  from "moment"
moment.locale("zh-cn")
const formatTime = {
    getTime:(date)=>{
        return moment(date).format('LLL');
    }
}

export default formatTime