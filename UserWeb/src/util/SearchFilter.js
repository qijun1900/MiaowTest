import { computed } from "vue";
const useSearchFilter = (data, searchText) => {
    const filteredData = computed(() => {
        if (!searchText.value) {
            return [];
        } else {
            return data.value.filter(item => {
                return item.name.toLowerCase().includes(searchText.value.toLowerCase());
            });
        }
    });
    return filteredData; 
};
export default useSearchFilter;