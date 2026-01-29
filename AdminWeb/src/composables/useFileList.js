import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFileList, getTags, deleteFile, updateFile } from '@/API/Resource/FileAPI'

/**
 * 文件列表管理组合式函数
 * @returns {Object} 文件列表相关的状态和方法
 */
export function useFileList() {
  // ========== 响应式状态 ==========
  const loading = ref(false)           // 加载状态
  const isRefreshing = ref(false)      // 刷新状态
  const searchQuery = ref('')          // 搜索关键词
  const selectedTag = ref('')          // 选中的标签
  const currentPage = ref(1)           // 当前页码
  const pageSize = ref(20)             // 每页数量
  const total = ref(0)                 // 总数据量
  const tableData = ref([])            // 表格数据
  const selectedFile = ref(null)       // 当前选中的文件
  const tagOptions = ref([])           // 标签选项列表

  /**
   * 获取标签列表
   */
  const fetchTags = async () => {
    try {
      const response = await getTags()
      if (response.code === 200) {
        tagOptions.value = response.data.map(tag => ({
          label: tag,
          value: tag
        }))
      }
    } catch (error) {
      console.error('获取标签失败', error)
    }
  }

  /**
   * 获取文件列表数据
   */
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getFileList({
        search: searchQuery.value,
        tag: selectedTag.value,
        page: currentPage.value,
        size: pageSize.value
      })
      if (res.code === 200) {
        tableData.value = res.data.list
        total.value = res.data.total
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('获取文件列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理搜索
   * @param {string} query - 搜索关键词
   */
  const handleSearch = (query) => {
    searchQuery.value = query
    currentPage.value = 1
    fetchData()
  }

  /**
   * 处理标签筛选变化
   * @param {string} tag - 选中的标签
   */
  const handleTagChange = (tag) => {
    selectedTag.value = tag
    currentPage.value = 1
    fetchData()
  }

  /**
   * 处理分页变化
   * @param {Object} params - 分页参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   */
  const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    fetchData()
  }

  /**
   * 刷新数据
   */
  const refreshData = async () => {
    isRefreshing.value = true
    try {
      await fetchData()
      ElMessage.success('刷新成功')
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * 处理当前行变化
   * @param {Object} file - 选中的文件
   */
  const handleCurrentChange = (file) => {
    selectedFile.value = file
  }

  /**
   * 删除文件
   * @param {Object} file - 要删除的文件
   */
  const handleDelete = (file) => {
    ElMessageBox.confirm(
      `确定要删除文件 "${file.name}" 吗？\n\n删除操作不可逆，该文件将被永久移除，相关引用也会失效。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger',
        center: true,
        showClose: true,
        closeOnClickModal: false,
        closeOnPressEscape: true
      }
    ).then(async () => {
      try {
        const res = await deleteFile(file._id)
        if (res.code === 200) {
          ElMessage.success('文件删除成功')
          // 如果删除的是当前选中的文件，清空选中状态
          if (selectedFile.value && selectedFile.value._id === file._id) {
            selectedFile.value = null
          }
          await fetchData()
        } else {
          ElMessage.error(`文件删除失败: ${res.message}`)
        }
      } catch (err) {
        console.error(err)
        ElMessage.error('文件删除失败')
      }
    }).catch(() => {
      ElMessage.info('已取消删除操作')
    })
  }

  /**
   * 更新文件
   * @param {Object} data - 更新数据
   */
  const handleUpdate = async (data) => {
    try {
      const response = await updateFile(data)
      if (response.code === 200) {
        ElMessage.success(data.file ? '文件替换成功' : '文件信息更新成功')
        await fetchData()
        // 如果更新的是当前选中的文件，更新选中状态
        if (selectedFile.value && selectedFile.value._id === data._id) {
          const updatedFile = tableData.value.find(f => f._id === data._id)
          if (updatedFile) {
            selectedFile.value = updatedFile
          }
        }
        return true
      } else {
        ElMessage.error(`文件更新失败: ${response.message}`)
        return false
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('文件更新失败')
      return false
    }
  }

  /**
   * 复制链接
   * @param {string} url - 要复制的URL
   */
  const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制')
    })
  }

  /**
   * 下载文件
   * @param {Object} file - 要下载的文件
   */
  const downloadFile = (file) => {
    ElMessage.info(`开始下载: ${file.name}`)
    // TODO: 实现下载逻辑
  }

  return {
    // ========== 状态 ==========
    loading,
    isRefreshing,
    searchQuery,
    selectedTag,
    currentPage,
    pageSize,
    total,
    tableData,
    selectedFile,
    tagOptions,

    // ========== 方法 ==========
    fetchTags,
    fetchData,
    handleSearch,
    handleTagChange,
    handlePageChange,
    refreshData,
    handleCurrentChange,
    handleDelete,
    handleUpdate,
    copyLink,
    downloadFile
  }
}
