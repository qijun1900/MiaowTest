import moment  from "moment"
moment.locale("zh-cn")


const formatTime = {
    getTime:(date)=>{

        return moment(date).format('L');

    }
}

export default formatTime