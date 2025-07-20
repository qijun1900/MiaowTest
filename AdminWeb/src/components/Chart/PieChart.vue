<template>
  <Pie
    id="pie-chart-id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const chartData = {
  labels: ['产品A', '产品B', '产品C', '产品D'],
  datasets: [
    {
      data: [300, 50, 100, 40],
      backgroundColor: [
        '#1696ff',
        '#36a2eb',
        '#4bc0c0',
        '#ff9f40'
      ],
      borderWidth: 1
    }
  ]
}

const chartOptions = {
  responsive: true,  // 启用响应式
  maintainAspectRatio: false,  // 不保持宽高比
  plugins: {
    title: {
      display: true,
      text: '产品销售占比',
      color: '#1696ff'
    }
  }
}
</script>
