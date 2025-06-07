<template>
    <div>
        <Sender
            v-model:value="userinput"
            :loading="loading"
            :auto-size="{ minRows: 1, maxRows: 6 }"
            @submit="() => {
                value = ''
                loading = true
            }"
            @cancel="() => {
                loading = false
            }"
        />
    </div>
</template>
<script setup>
import { Sender } from 'ant-design-x-vue'
import  {ref} from 'vue'

const loading = ref(false)
const userinput = ref('')

</script>
<style scoped>
</style>