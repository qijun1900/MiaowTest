<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
  >
    <g stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
      <path 
        fill="#2F88FF" 
        stroke="#000" 
        d="M39 4H11C9.89543 4 9 4.89543 9 6V42C9 43.1046 9.89543 44 11 44H39C40.1046 44 41 43.1046 41 42V6C41 4.89543 40.1046 4 39 4Z"
      />
      <path 
        stroke="#fff" 
        d="M17 30L31 30"
      />
      <path 
        stroke="#fff" 
        d="M17 36H24"
      />
      <rect 
        width="14" 
        height="10" 
        x="17" 
        y="12" 
        fill="#2F88FF" 
        stroke="#fff"
      />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 41
  }
})
</script>