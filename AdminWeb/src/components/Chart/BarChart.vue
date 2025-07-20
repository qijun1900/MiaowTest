<template>
  <Bar
    id="my-chart-id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['January', 'February', 'March','Juary', 'Fery', 'Mach',"Musg"],
  datasets: [{ 
    data: [40, 20, 12, 30, 20, 12,12,],
    backgroundColor: [
      '#1696ff',  // 第一个柱子的颜色
      '#36a2eb',  // 第二个柱子的颜色
      '#4bc0c0',  // 第三个柱子的颜色
      '#ff9f40',  // 第四个柱子的颜色
      '#ff6384',  // 第五个柱子的颜色
      '#9966ff' , // 第六个柱子的颜色
      '#1696ff',  // 第七个柱子的颜色
    ]
  }]
}

const chartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: '我的图表标题',
      font: {
        size: 16
      },
      color: '#1696ff',
      padding: {
        top: 10,
        bottom: 10  // 添加底部内边距
      },
      align: 'center'  // 确保标题居中
    },
    legend: {  // 确保图例配置存在
      display: false  // 如果你不需要图例可以隐藏
    }
  }
}
</script>