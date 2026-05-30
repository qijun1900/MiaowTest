<template>
    <t-overlay
        :visible="props.show"
        @click="handleClose"
    >
        <view class="warp">
            <view @tap.stop>
                <slot name="overlaycontent"></slot>
            </view>
        </view>
    </t-overlay>
</template>
<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:show"]);
const handleClose = () => {
    emit("update:show", false);
};
</script>
<style scoped>
.warp {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>
