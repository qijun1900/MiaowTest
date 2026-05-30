<template>
    <t-divider
        :content="props.text"
        :align="props.textPosition"
        :custom-style="{ color: '#007AFF', borderColor: '#86bbf5' }"
    >
    </t-divider>
</template>
<script setup>
const props = defineProps({
    text: {
        // ��������
        type: String,
        default: "��������",
    },
    textPosition: {
        // ����λ��
        type: String,
        default: "left", // ��ѡֵ��left��right
    },
});
</script>
