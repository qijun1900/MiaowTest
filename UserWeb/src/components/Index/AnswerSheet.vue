<template>
    <div>
        <van-popup
        :v-model:show="props.show"
        closeable
        close-icon="close"
        position="bottom"
        :style="{ height: '30%' }"
        />
    </div>    
   
</template>
<script setup>

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
}); 
</script>
<style></style>