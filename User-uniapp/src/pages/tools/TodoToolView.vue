<template>
  <view class="container">
    <view>
      <lxCalendar @change="handleChange"/>
    </view>

  </view>
</template>

<script  setup>
import lxCalendar from '../../components/lx-calendar/lx-calendar.vue';

const handleChange = (e) => {
  console.log(e)
}

</script>

<style scoped></style>