//点击查看详细信息
import { ElMessage } from "element-plus";
const handleLooked = (content) => {
    ElMessage({
        showClose: true,
        dangerouslyUseHTMLString: true,// 允许使用 HTML 内容
        message: `信息内容为:${content}`,
        duration: 5000,
        type: 'primary',
        plain: true,
    })
}
export default handleLooked;