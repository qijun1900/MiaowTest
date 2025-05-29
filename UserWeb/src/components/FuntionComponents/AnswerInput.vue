<template>
<van-config-provider :theme-vars="themeVars">
    <div>
        <div class="input-container">
            <van-cell-group inset v-for="(option, index) in options" :key="index">
                <van-field
                v-model="userAnswers[index]"
                clearable
                :label="'空' + (index + 1)"
                left-icon="award"
                :placeholder="'请输入答案'"
                autosize
                type="textarea"
                :colon="true"
                size="large"
                maxlength="1000"
                show-word-limit
                label-width="2.3em"/>
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
    options: {
        type: Array,
        default: () => []
    },
    modelValue: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const userAnswers = ref(props.modelValue.length > 0 ? [...props.modelValue] : props.options.map(() => ''))

watch(() => props.modelValue, (newVal) => {
    if (newVal.length > 0) {
        userAnswers.value = [...newVal]
    }
});

const themeVars = reactive({
    fieldLabelColor:"#1874ff",
    fieldIconSize:"25px",
    fieldClearIconColor:"#ff5775",
    cellBackground:"#f7f8fa",
})

const submitAnswers = () => {
    emit('update:modelValue', userAnswers.value)
    emit('submit', userAnswers.value)
}
</script>
<style>
.input-container{
    display: flex;
    flex-direction: column;
    gap: 22px;
}
.checkbutton--container{
    margin-top: 30px;
}
</style>