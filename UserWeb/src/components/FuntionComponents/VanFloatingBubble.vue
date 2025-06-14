<template>
    <div v-if="props.isShow">
        <van-floating-bubble 
            @click="onClick" 
            axis="xy"
            magnetic="x"
            v-model:offset="offset">
            <div>
                <van-icon>
                    <slot name="FloatingIcon"></slot>
                </van-icon>
            </div>
        </van-floating-bubble>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const emit = defineEmits(['handelClick']);
const props = defineProps({
    isShow: { // 控制是否显示
        type: Boolean,
        default: true,
    },
})
const offset = ref({ x: 320, y: 600 }); // 初始偏移量

const onClick = () => {
    emit('handelClick',true);
}



</script>

