// 搜索事件处理(按下回车触发，或者点击搜索按钮)
import RouterPush from '@/util/RouterPush'
const UseonSearch = (path,searchText,searchResult,) => {
    RouterPush(path,{
        searchText:searchText,
        searchResult:JSON.stringify(searchResult)
    })
}
export default UseonSearch