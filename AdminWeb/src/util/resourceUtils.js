export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const getCategoryLabel = (category) => {
  const labels = {
    1: '图片',
    2: '文档',
    3: '视频',
    4: '音频',
    5: '其他'
  }
  return labels[category] || '未知'
}

export const getCategoryTagType = (category) => {
  const types = {
    1: 'success',
    2: 'primary',
    3: 'danger',
    4: 'warning',
    5: 'info'
  }
  return types[category] || 'info'
}

export const autoDetectCategory = (mimeType, fileName) => {
  if (!mimeType && fileName) {
    const ext = fileName.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 1
    else if (['doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt', 'md'].includes(ext)) return 2
    else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 3
    else if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) return 4
    else return 5
  }

  const typePrefix = mimeType.split('/')[0]
  if (typePrefix === 'image') return 1
  else if (typePrefix === 'video') return 3
  else if (typePrefix === 'audio') return 4
  else if (typePrefix === 'text' || mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('sheet')) {
    return 2
  } else {
    return 5
  }
}
