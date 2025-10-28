import { ref } from 'vue'
import { ElMessage } from 'element-plus'
//Api请求方法
//表格操作方法
export function useTableActions() {
    const selectedRows = ref([])// 选中的行数据
    
    const handleSelectionChange = (val) => {
        selectedRows.value = val
    }
    
    // 
    // handleDelete 方法，只需要传入一个API函数,支持单条和批量删除
    const handleDelete = async(target, deleteAPI) => {
        try {
            if (Array.isArray(target)) {
                const Ids = target.map(ids => ids._id)
                const res = await deleteAPI(Ids)  // 批量删除时传入数组
                if(res.ActionType === 'OK'){
                    ElMessage.success('批量删除成功')
                }
            } else {
                const res = await deleteAPI(target._id)  // 单条删除时传入单个ID
                if(res.ActionType === 'OK'){
                    ElMessage.success('单条删除成功')
                }
            }
        } catch (error) {
            console.error('删除失败:', error)
            throw error
        }
    }

    //表格刷新方法
    const handleRefresh =async  (params = {},API) => {
        try{
           const res  =  await API({
            page: params.page || 1,
            size: params.size || 20,
            ...params
           })
           if(res.ActionType=== 'OK'){
            ElMessage.success('表格刷新成功')
            return res // 返回响应数据
           }
        }catch(error){
            console.error('刷新表格失败:', error)
            throw error
        }
    }
    return { selectedRows, handleSelectionChange, handleDelete,handleRefresh }
}