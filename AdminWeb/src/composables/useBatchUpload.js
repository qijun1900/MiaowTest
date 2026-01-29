import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadFile } from '@/API/Resource/FileAPI'
import { autoDetectCategory } from '@/util/resourceUtils'

/**
 * 批量上传组合式函数
 * @param {Object} appStore - 应用状态管理store
 * @returns {Object} 返回上传相关的状态、配置和方法
 */
export function useBatchUpload(appStore) {
  // ========== 上传配置常量 ==========
  const maxFileSizeMB = 100  // 单个文件最大100MB
  const maxFileCount = 20    // 最多20个文件
  const acceptedFileTypes = '.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp4,.avi,.mov,.wmv,.flv,.mp3,.wav,.aac,.flac'

  // ========== 响应式状态 ==========
  const isUploading = ref(false)      // 是否正在上传
  const uploadQueue = ref([])         // 上传队列
  let fileIdCounter = 0               // 文件ID计数器

  // ========== 批量配置 ==========
  const batchConfig = reactive({
    category: 0,              // 0=自动识别, 1=图片, 2=文档, 3=视频, 4=音频, 5=其他
    tag: '',                  // 统一标签（必填）
    description: '',          // 统一描述
    concurrency: 2,           // 并发上传数（1-5）
    errorHandling: 'continue' // 错误处理：continue=继续, stop=停止
  })

  // ========== 计算属性 ==========
  
  /**
   * 已完成上传的文件数量（包括成功和失败）
   */
  const uploadedCount = computed(() => {
    return uploadQueue.value.filter(item => 
      item.status === 'success' || item.status === 'error'
    ).length
  })

  /**
   * 整体上传进度百分比（0-100）
   */
  const overallProgress = computed(() => {
    if (uploadQueue.value.length === 0) return 0
    const total = uploadQueue.value.length
    const completed = uploadedCount.value
    return Math.round((completed / total) * 100)
  })

  /**
   * 整体进度状态
   * @returns {string|undefined} 'success' | 'exception' | undefined
   */
  const overallProgressStatus = computed(() => {
    const hasError = uploadQueue.value.some(item => item.status === 'error')
    if (hasError && uploadedCount.value === uploadQueue.value.length) {
      return 'exception'
    }
    if (uploadedCount.value === uploadQueue.value.length && uploadQueue.value.length > 0) {
      return 'success'
    }
    return undefined
  })

  // ========== 核心方法 ==========
  
  /**
   * 验证文件是否符合上传要求
   * @param {File} file - 要验证的文件对象
   * @returns {string|null} 错误信息，无错误返回null
   */
  const validateFile = (file) => {
    const maxSize = maxFileSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `文件 ${file.name} 超过 ${maxFileSizeMB}MB 限制`
    }
    
    const fileName = file.name.toLowerCase()
    const ext = fileName.substring(fileName.lastIndexOf('.'))
    const acceptedExts = acceptedFileTypes.split(',')
    if (!acceptedExts.includes(ext)) {
      return `文件 ${file.name} 格式不支持`
    }
    
    return null
  }

  /**
   * 创建队列项对象
   * @param {File} file - 文件对象
   * @returns {Object} 队列项对象
   */
  const createQueueItem = (file) => {
    const fileName = file.name
    const lastDotIndex = fileName.lastIndexOf('.')
    const ext = lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
    
    let category = batchConfig.category
    if (category === 0) {
      category = autoDetectCategory(file.type, file.name)
    }
    
    return {
      id: ++fileIdCounter,
      file: file,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      ext: ext,
      category: category,
      tag: batchConfig.tag,
      description: batchConfig.description,
      status: 'waiting',
      progress: 0,
      errorMsg: '',
      creator: appStore.userInfo.username
    }
  }

  /**
   * 添加文件到上传队列
   * @param {File[]} files - 文件数组
   */
  const addFilesToQueue = (files) => {
    if (uploadQueue.value.length + files.length > maxFileCount) {
      ElMessage.warning(`最多只能上传 ${maxFileCount} 个文件`)
      return
    }
    
    const validFiles = []
    const errors = []
    
    files.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })
    
    if (errors.length > 0) {
      ElMessage.error({
        message: errors.join('\n'),
        duration: 5000
      })
    }
    
    validFiles.forEach(file => {
      const queueItem = createQueueItem(file)
      uploadQueue.value.push(queueItem)
    })
    
    if (validFiles.length > 0) {
      ElMessage.success(`已添加 ${validFiles.length} 个文件到上传队列`)
    }
  }

  /**
   * 清空上传队列（需用户确认）
   * @returns {Promise<boolean>} 是否成功清空
   */
  const clearQueue = () => {
    return ElMessageBox.confirm(
      '确定要清空上传队列吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      uploadQueue.value = []
      ElMessage.success('已清空队列')
      return true
    }).catch(() => {
      return false
    })
  }

  /**
   * 从队列中移除指定文件
   * @param {number} id - 文件ID
   */
  const removeFromQueue = (id) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index > -1) {
      uploadQueue.value.splice(index, 1)
    }
  }

  /**
   * 上传单个文件
   * @param {Object} item - 队列项对象
   * @param {Object} tagOptions - 标签选项ref对象
   * @returns {Promise<boolean>} 是否上传成功
   */
  const uploadSingleFile = async (item, tagOptions) => {
    if (item.status === 'uploading') return true
    
    if (!item.tag || item.tag.trim() === '') {
      item.status = 'error'
      item.errorMsg = '标签不能为空'
      return false
    }
    
    item.status = 'uploading'
    item.progress = 0
    item.errorMsg = ''
    
    try {
      const progressInterval = setInterval(() => {
        if (item.progress < 90) {
          item.progress += Math.random() * 20
          if (item.progress > 90) item.progress = 90
        }
      }, 300)
      
      const formData = {
        file: item.file,
        name: item.name,
        category: item.category,
        tag: item.tag,
        description: item.description,
        ext: item.ext,
        size: item.size,
        mimeType: item.mimeType,
        creator: item.creator
      }
      
      const response = await uploadFile(formData)
      
      clearInterval(progressInterval)
      
      if (response.code === 200) {
        item.status = 'success'
        item.progress = 100
        
        if (item.tag && tagOptions && !tagOptions.value.find(t => t.value === item.tag)) {
          tagOptions.value.push({ label: item.tag, value: item.tag })
        }
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error) {
      item.status = 'error'
      item.errorMsg = error.message || '上传失败'
      console.error('上传失败:', error)
      
      if (batchConfig.errorHandling === 'stop') {
        isUploading.value = false
        ElMessage.error('上传失败，已停止所有上传任务')
        return false
      }
    }
    
    return true
  }

  /**
   * 开始批量上传
   * @param {Object} tagOptions - 标签选项ref对象
   */
  const startBatchUpload = async (tagOptions) => {
    if (uploadQueue.value.length === 0) {
      ElMessage.warning('请先添加文件到队列')
      return
    }
    
    
    if (!batchConfig.tag || batchConfig.tag.trim() === '') {
      ElMessage.warning('请先选择或输入标签')
      return
    }
    
    isUploading.value = true
    const concurrency = batchConfig.concurrency
    
    uploadQueue.value.forEach(item => {
      if (item.status === 'waiting' || item.status === 'error' || item.status === 'paused') {
        item.status = 'waiting'
        item.progress = 0
        item.errorMsg = ''
        item.tag = batchConfig.tag
        item.description = batchConfig.description
      }
    })
    
    const uploadPromises = []
    let currentIndex = 0
    
    const uploadNext = async () => {
      while (currentIndex < uploadQueue.value.length) {
        const item = uploadQueue.value[currentIndex]
        currentIndex++
        
        if (item.status === 'waiting') {
          const success = await uploadSingleFile(item, tagOptions)
          if (!success && batchConfig.errorHandling === 'stop') {
            return
          }
        }
      }
    }
    
    for (let i = 0; i < concurrency; i++) {
      uploadPromises.push(uploadNext())
    }
    
    await Promise.all(uploadPromises)
    
    isUploading.value = false
    
    const successCount = uploadQueue.value.filter(item => item.status === 'success').length
    const errorCount = uploadQueue.value.filter(item => item.status === 'error').length
    
    if (errorCount === 0) {
      ElMessage.success(`全部上传成功！共 ${successCount} 个文件`)
    } else {
      ElMessage.warning(`上传完成：成功 ${successCount} 个，失败 ${errorCount} 个`)
    }
  }

  /**
   * 暂停单个文件上传
   * @param {Object} item - 队列项对象
   */
  const pauseUpload = (item) => {
    if (item.status === 'uploading') {
      item.status = 'paused'
    }
  }

  /**
   * 暂停所有正在上传的文件
   */
  const pauseAllUploads = () => {
    uploadQueue.value.forEach(item => {
      if (item.status === 'uploading') {
        item.status = 'paused'
      }
    })
    isUploading.value = false
    ElMessage.info('已暂停所有上传任务')
  }

  /**
   * 重试上传失败的文件
   * @param {Object} item - 队列项对象
   * @param {Object} tagOptions - 标签选项ref对象
   */
  const retryUpload = (item, tagOptions) => {
    uploadSingleFile(item, tagOptions)
  }

  return {
    // ========== 状态 ==========
    isUploading,        // 是否正在上传
    uploadQueue,        // 上传队列数组
    batchConfig,        // 批量配置对象（包含分类、标签、描述等）
    
    // ========== 计算属性 ==========
    uploadedCount,      // 已完成上传的文件数量（成功+失败）
    overallProgress,    // 整体上传进度百分比（0-100）
    overallProgressStatus, // 整体进度状态（success/exception/undefined）
    
    // ========== 配置常量 ==========
    maxFileSizeMB,      // 单个文件最大大小（MB）
    maxFileCount,       // 最多上传文件数量
    acceptedFileTypes,  // 支持的文件格式（逗号分隔）
    
    // ========== 方法 ==========
    addFilesToQueue,    // 添加文件到上传队列
    clearQueue,         // 清空上传队列
    removeFromQueue,    // 从队列中移除指定文件
    uploadSingleFile,   // 上传单个文件
    startBatchUpload,   // 开始批量上传
    pauseUpload,        // 暂停单个文件上传
    pauseAllUploads,    // 暂停所有上传
    retryUpload         // 重试上传失败的文件
  }
}
