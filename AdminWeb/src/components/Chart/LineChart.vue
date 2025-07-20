<template>
  <Line
    id="line-chart-id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const chartData = {
  labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
  datasets: [
    {
      label: '销售额',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#1696ff',
      backgroundColor: 'rgba(22, 150, 255, 0.2)',
      tension: 0.4
    }
  ]
}

const chartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: '月度销售趋势',
      color: '#1696ff'
    }
  }
}
</script>
