<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 384 384"
    :fill="color"
  >
    <path
      d="m27 43l6 5l308 309l-27 27l-121-121l-33 78H96l53-123L0 70zm58 0h299v64H260l-34 80l-45-44l16-36h-52L85 47z"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: '#080808'
  }
})
</script>