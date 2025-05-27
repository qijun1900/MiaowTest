<template>
<van-config-provider :theme-vars="themeVars">
    <div>
        <div class="input-container">
            <van-cell-group inset v-for="(option, index) in options" :key="index">
                <van-field
                v-model="userAnswers[index]"
                clearable
                :label="'空' + (index + 1)"
                left-icon="eye"
                :placeholder="'请输入答案'"
                autosize
                type="textarea"
                :colon="true"
                size="large"/>
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
import { ref, reactive } from 'vue';
import CheckanswerButton from './CheckanswerButton.vue';

const props = defineProps({
    options: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['submit']);

const userAnswers = ref(props.options.map(() => ''));
const themeVars = reactive({
    fieldLabelColor:"#1874ff",
    fieldIconSize:"23px",
    fieldClearIconColor:"#ff5775",
    cellBackground:"#f7f8fa",
})

// 添加提交答案的方法
const submitAnswers = () => {
    emit('submit', userAnswers.value);
}
</script>
<style>
.input-container{
    display: flex;
    flex-direction: column;
    gap: 22px;
}
.checkbutton--container{
    margin-top: 40px;
}
</style>