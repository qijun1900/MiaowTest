import { computed } from "vue";
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
export default useSearchFilter;