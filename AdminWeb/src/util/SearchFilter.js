import { computed } from "vue";

// /FunComponents/SearchFilter组件搜索筛选函数
const useSearchFilter = (data, searchText, searchField) => {
    const filteredData = computed(() => {
        if (!searchText) {  
            return Array.isArray(data) ? data : data.value;
        } else {
            const sourceData = Array.isArray(data) ? data : data.value;
            return sourceData.filter(item => {
                const searchValue = String(searchText).toLowerCase();
                if (Array.isArray(searchField)) {
                    return searchField.some(field => 
                        String(item[field] || '').toLowerCase().includes(searchValue)
                    );
                }
                return String(item[searchField] || '').toLowerCase().includes(searchValue);
            });
        }
    });
    return filteredData;
};

// 用户列表筛选函数
const useConsumerFilter = (data, filterForm) => {
    const filteredData = computed(() => {
        // 如果没有筛选条件，直接返回原始数据
        if (!filterForm.value._id && 
            !filterForm.value.userType && 
            filterForm.value.gender === null && 
            (!filterForm.value.dateRange || filterForm.value.dateRange.length === 0)) {
            return Array.isArray(data) ? data : data.value;
        }
        
        // 应用筛选条件
        const sourceData = Array.isArray(data) ? data : data.value;
        return sourceData.filter(item => {
            // UID筛选
            if (filterForm.value._id && !item._id?.includes(filterForm.value._id)) {
                return false;
            }
            
            // 用户类型筛选
            if (filterForm.value.userType) {
                if (filterForm.value.userType === 'wechat' && !item.openid) return false;
                if (filterForm.value.userType === 'web' && item.openid) return false;
            }
            
            // 性别筛选
            if (filterForm.value.gender !== null && item.gender !== filterForm.value.gender) {
                return false;
            }
            
            // 日期范围筛选
            if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
                const createTime = new Date(item.createTime);
                const startDate = new Date(filterForm.value.dateRange[0]);
                const endDate = new Date(filterForm.value.dateRange[1]);
                endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
                
                if (createTime < startDate || createTime > endDate) {
                    return false;
                }
            }
            
            return true;
        });
    });
    
    return filteredData;
};

// 反馈列表筛选函数
const useFeedbackFilter = (data, filterForm) => {
    const filteredData = computed(() => {
        let list = Array.isArray(data) ? data : data.value;
        
        // 按反馈类型筛选
        if (filterForm.value.type !== '') {
            list = list.filter(item => item.type === filterForm.value.type);
        }
        
        // 按处理状态筛选
        if (filterForm.value.status !== '') {
            list = list.filter(item => item.status === filterForm.value.status);
        }
        
        // 按用户状态筛选
        if (filterForm.value.userStatus !== '') {
            if (filterForm.value.userStatus === 'loggedIn') {
                list = list.filter(item => item.uid !== null);
            } else if (filterForm.value.userStatus === 'notLoggedIn') {
                list = list.filter(item => item.uid === null);
            }
        }
        
        return list;
    });
    
    return filteredData;
};

// 网盘资料筛选函数
const useNetDiskFilter = (data, filterForm) => {
    const filteredData = computed(() => {
        let list = Array.isArray(data) ? data : data.value;
        
        // 按资料名称筛选
        if (filterForm.title) {
            list = list.filter(item => 
                String(item.title || '').toLowerCase().includes(filterForm.title.toLowerCase())
            );
        }
        
        // 按网盘类型筛选
        if (filterForm.diskType !== null && filterForm.diskType !== '') {
            list = list.filter(item => 
                item.content && item.content[0] && item.content[0].type === filterForm.diskType
            );
        }
        
        // 按发布状态筛选
        if (filterForm.isPublish !== null && filterForm.isPublish !== '') {
            list = list.filter(item => item.isPublish === filterForm.isPublish);
        }
        
        return list;
    });
    
    return filteredData;
};

export { useSearchFilter, useConsumerFilter, useFeedbackFilter, useNetDiskFilter }
