<template>
    <div>
        CreateExam.vue
    </div>
</template>
<script setup>

import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter,useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const examData = ref(route.query.examData)

onMounted(async () => {
   
})
</script>