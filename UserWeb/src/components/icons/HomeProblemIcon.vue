<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    aria-hidden="true"
  >
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
      <path fill="#2F88FF" stroke="currentColor" d="M44 6H4V36H13V41L23 36H44V6Z"/>
      <path stroke="#fff" d="M14 19.5V22.5"/>
      <path stroke="#fff" d="M24 19.5V22.5"/>
      <path stroke="#fff" d="M34 19.5V22.5"/>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 38
  }
})
</script>