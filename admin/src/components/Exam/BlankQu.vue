<template>
    BlankQu.vue
</template>
<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
onMounted(()=>{
    console.log("@@@ID",route.params.id);
})


</script>