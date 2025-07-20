<template>
  <div class="todo-container">
    <el-input 
      v-model="newTodo" 
      placeholder="输入新任务" 
      @keyup.enter="addTodo"
      class="todo-input"
    >
      <template #append>
        <el-button @click="addTodo" :icon="Plus" />
      </template>
    </el-input>
    
    <el-scrollbar height="200px" v-loading="loading">
      <div v-for="todo in todos" :key="todo.id" class="todo-item">
        <el-checkbox 
          :model-value="todo.completed" 
          @change="() => toggleTodo(todo)"
        >
          <span :class="{ 'completed': todo.completed }">
            {{ todo.title }}
          </span>
        </el-checkbox>
        <el-button 
          type="danger" 
          :icon="Delete" 
          circle 
          size="small"
          @click="removeTodo(todo)"
          :loading="loading"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getTodos, postTodos ,postDeleteTodos,postUpdateTodos} from '@/API/Fun/todos'

const newTodo = ref('')
const todos = ref([])
const loading = ref(false)

// 获取待办事项列表
const fetchTodos = async () => {
  loading.value = true
  try {
    const res = await getTodos()
    todos.value = res.data
  } finally {
    loading.value = false
  }
}

// 添加待办事项
const addTodo = async () => {
  if (!newTodo.value.trim()) return
  
  try {

    await postTodos({ title: newTodo.value.trim() })
    await fetchTodos()
    newTodo.value = ''
  } catch (error) {
    console.error('添加失败:', error)
  }
}

// 删除待办事项
const removeTodo = async (todo) => {
  try {
    await postDeleteTodos(todo._id)
    console.log(todo._id)
    await fetchTodos()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 切换完成状态
const toggleTodo = async (todo) => {
  try {
    await postUpdateTodos(todo._id)
    await fetchTodos()
  } catch (error) {
    console.error('状态更新失败:', error)
  }
}

// 初始化加载数据
onMounted(() => {
  fetchTodos()
})
</script>

<style scoped>
.todo-container {
  padding: 10px;
}
.todo-input {
  margin-bottom: 10px;
}
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}
.completed {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
}
</style>
