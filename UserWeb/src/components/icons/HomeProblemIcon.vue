<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
  >
    <g>
      <path
        fill="#2F88FF"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
        d="M10 44H38C39.1046 44 40 43.1046 40 42V14H30V4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44Z"
      />
      <path
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
        d="M30 4L40 14"
      />
      <path
        stroke="#fff"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
        d="M24 31V28C26.2091 28 28 25.9853 28 23.5C28 21.0147 26.2091 19 24 19C21.7909 19 20 21.0147 20 23.5"
      />
      <path
        fill="#fff"
        fill-rule="evenodd"
        d="M24 39C25.3807 39 26.5 37.8807 26.5 36.5C26.5 35.1193 25.3807 34 24 34C22.6193 34 21.5 35.1193 21.5 36.5C21.5 37.8807 22.6193 39 24 39Z"
        clip-rule="evenodd"
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