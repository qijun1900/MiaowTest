<template>
<van-config-provider :theme-vars="themeVars">
    <div class="multiple-button">
        <van-button 
            icon="checked" 
            type="primary" 
            :round="true" 
            color="#2e66ff" 
            size="normal"
            @click="handleClick">
            {{ buttonText }}
        </van-button>
    </div>
</van-config-provider>
</template>
<script setup>
import { computed ,reactive} from 'vue';
const props = defineProps({
    isMultiple: {
        type: Boolean,
        required: true
    },
    selectedOptions: {
        type: Array,
        default: () => []
    },
    questionOptions: {
        type: Array,
    }
})

const emit = defineEmits(['submit', 'show'])

const buttonText = computed(() => props.isMultiple ? '检查答案' : '查看答案')

const handleClick = () => {
    if (props.isMultiple) {
        // 多选题逻辑 - 检查答案
        const correctOptions = props.questionOptions
            .map((option, index) => option.isCorrect ? index : -1)
            .filter(index => index !== -1)
        const isCorrect = 
            props.selectedOptions.length === correctOptions.length &&
            props.selectedOptions.every(option => correctOptions.includes(option))
        
        emit('submit', {
            selected: props.selectedOptions,
            correct: correctOptions,
            isCorrect
        })
    } else {
        // 点击直接显示答案
        emit('show')
    }
}
const themeVars = reactive({
    buttonNormalFontSize: '17px',
    buttonIconSize: "25px",
})
</script>
<style scoped>
.multiple-button {
    display: flex;
    justify-content: center;
}
</style>