import { isImage, isVideo, isAudio } from './resourceUtils';
import formatTime from './formatTime';

/**
 * 获取文件图标类名
 * @param {Object} row - 文件对象
 * @returns {string} 图标类名
 */
export const getFileIconClass = (row) => {
  if (isImage(row)) return 'file-icon-image';
  if (isVideo(row)) return 'file-icon-video';
  if (isAudio(row)) return 'file-icon-audio';
  return 'file-icon-document';
};

/**
 * 获取文件类型标签类型
 * @param {string} mimeType - 文件MIME类型
 * @returns {string} 标签类型
 */
export const getFileTypeTagType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'primary';
  if (mimeType.startsWith('video/')) return 'warning';
  if (mimeType.startsWith('audio/')) return 'success';
  if (mimeType.startsWith('text/') || mimeType.includes('document')) return 'info';
  return 'default';
};

/**
 * 生成表格行类名
 * @param {Object} param0 - 行信息
 * @returns {string} 行类名
 */
export const tableRowClassName = ({rowIndex}) => {
  return `file-row-${rowIndex}`;
};

/**
 * 生成文件信息列表
 * @param {Object} selectedFile - 选中的文件对象
 * @returns {Array} 文件信息列表
 */
export const generateFileInfoList = (selectedFile) => {
  if (!selectedFile) return [];
  
  return [
    { label: '文件名', value: selectedFile.name },
    { label: '原始名', value: selectedFile.originalName },
    { 
      label: '类型', 
      value: selectedFile.mimeType.split('/')[1], 
      isTag: true, 
      tagType: getFileTypeTagType(selectedFile.mimeType) 
    },
    { label: '大小', value: formatFileSize(selectedFile.size) },
    { 
      label: '分辨率', 
      value: selectedFile.width ? `${selectedFile.width} x ${selectedFile.height}` : '-' 
    },
    { 
      label: '存储位置', 
      value: selectedFile.storage, 
      isTag: true, 
      tagType: 'info' 
    },
    { 
      label: '业务标签', 
      value: selectedFile.tag || '-', 
      isTag: selectedFile.tag ? true : false, 
      tagType: 'success' 
    },
    { label: '上传者', value: selectedFile.creator || 'Unknown' },
    { label: '创建时间', value: formatTime.formatDate(selectedFile.createTime) }
  ];
};

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
