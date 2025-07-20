import { ref } from 'vue'

// UI 状态管理
export function useTableState() {
    const showSearch = ref(true)// 搜索框是否显示
    const IsOpenStripe = ref(false)// 斑马纹是否显示
    
    const HandleHideSearch = () => showSearch.value = !showSearch.value
    const handleOpenStripe = () => IsOpenStripe.value = !IsOpenStripe.value
    
    return { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe }
}

// User搜索条件管理
export function useSearchUserFilters() {
    const input1 = ref('')
    const input2 = ref('')
    const input3 = ref('')
    
    const resetUserFilters = () => {
        input1.value = ''
        input2.value = ''
        input3.value = ''
    }
    
    return { input1, input2, input3, resetUserFilters }
}
