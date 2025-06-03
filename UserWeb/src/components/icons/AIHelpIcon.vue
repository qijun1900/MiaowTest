<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size * 0.6875"  
    viewBox="0 0 256 176"
    fill="none"
  >
    <path 
      :fill="color" 
      d="m147.487 0l70.081 175.78H256L185.919 0zM66.183 106.221l23.98-61.774l23.98 61.774zM70.07 0L0 175.78h39.18l14.33-36.914h73.308l14.328 36.914h39.179L110.255 0z"
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
    default: '#009dff'
  }
})
</script>