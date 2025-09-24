<template>
  <div class="manualImportView">manualImportView {{ bankName   }}</div>
</template>

<script  setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
const bankName = ref('')
onLoad((option) => {
  if(option.bankName){
    bankName.value = option.bankName
  }
})


</script>

<style scoped></style>