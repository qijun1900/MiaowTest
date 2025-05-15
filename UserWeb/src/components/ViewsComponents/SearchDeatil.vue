<template>
    <div class="containder"> 
        <div>
            <TopBack 
            :title="`有关${searchText}的搜索结果`" 
            :iconSize="27"
            navBarHeight="47px"/>
        </div>
        <div class="content">
            <ExamContainer v-if="searchResult.length > 0"
                :IsHotExamContainer="false"
                :Ishasborder="true"
                :GutterNumber="15"
                :UseData="searchResult"
            />
           <Empty  v-else Description="搜索结果为空"/>
        </div>
    </div>
</template>
<script setup>
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import { ref,onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ExamContainer from '../Index/ExamContainer.vue';
import Empty from '../FuntionComponents/Empty.vue';
const route = useRoute()
const searchText = ref('')
const searchResult = ref([])
onMounted(() => {
    if (route.query.searchText) {
        searchText.value = route.query.searchText
    }
    if (route.query.searchResult) {
        searchResult.value = JSON.parse(route.query.searchResult)
    }
})

</script>