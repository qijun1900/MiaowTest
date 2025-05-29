<template>
<van-config-provider :theme-vars="themeVars">
    <div>
        <div class="input-container">
            <van-cell-group inset>
                <van-field
                v-model="userAnswers"
                clearable
                :placeholder="'请在此处输入答案并自行判断'"
                :autosize="{
                    minHeight: 80
                }"
                type="textarea"
                :colon="true"
                size="large"
                maxlength="5000"
                show-word-limit/>
            </van-cell-group>
        </div>
        <div class="checkbutton--container">
            <CheckanswerButton 
            @click="submitAnswers"
            :isMultiple="false"/>
        </div>
    </div>
</van-config-provider>
</template>
<script setup>
import { ref, reactive, watch } from 'vue';
import CheckanswerButton from './CheckanswerButton.vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const userAnswers = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
    userAnswers.value = newVal
})

const submitAnswers = () => {
    emit('update:modelValue', userAnswers.value)
    emit('submit', userAnswers.value)
}

const themeVars = reactive({
    fieldTextAreaMinHeight: "100px",
    cellBackground: "#f7f8fa",
})
</script>
<style scoped>
.checkbutton--container{
    margin-top: 20px;
}
</style>