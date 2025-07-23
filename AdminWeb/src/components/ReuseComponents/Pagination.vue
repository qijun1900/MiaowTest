<template>
    <el-pagination 
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    background 
    layout="total, sizes, prev, pager, next, jumper"
    :total="props.total" 
    :page-sizes="[10,20,30, 50, 100, 200, 500, 1000]"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    />
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  total: {// 总条数
    type: Number,
    default: 0
  },
  pageSize: {// 每页条数
    type: Number,
    default: 20
  },
  currentPage: {// 当前页码
    type: Number,
    default: 1
  },
})
const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'page-change'])

const handleSizeChange = (val) => {// 每页条数改变
  pageSize.value = val// 手动更新每页条数
  emit('update:pageSize', val)
  emit('page-change', { page: currentPage.value, size: val })
}

const handleCurrentChange = (val) => {// 当前页码改变
  currentPage.value = val// 手动更新当前页码
  emit('update:currentPage', val)
  emit('page-change', { page: val, size: pageSize.value })
}
</script>