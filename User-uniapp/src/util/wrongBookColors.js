// 错题本颜色配置
export const wrongBookColors = [
  // 绿色系
  '#4CAF50', // 绿色
  '#8BC34A', // 浅绿色
  '#CDDC39', // 柠檬绿
  '#009688', // 蓝绿色
  '#2E7D32', // 深绿色
  '#66BB6A', // 中绿色
  '#81C784', // 淡绿色
  '#A5D6A7', // 薄荷绿
  
  // 蓝色系
  '#2196F3', // 蓝色
  '#00BCD4', // 青色
  '#3F51B5', // 靛蓝色
  '#607D8B', // 蓝灰色
  '#1976D2', // 深蓝色
  '#42A5F5', // 亮蓝色
  '#64B5F6', // 天蓝色
  '#90CAF9', // 淡蓝色
  '#0288D1', // 海蓝色
  '#26C6DA', // 湖蓝色
  
  // 紫色系
  '#9C27B0', // 紫色
  '#673AB7', // 深紫色
  '#7B1FA2', // 深紫罗兰
  '#AB47BC', // 中紫色
  '#BA68C8', // 淡紫色
  '#CE93D8', // 浅紫色
  '#E1BEE7', // 粉紫色
  
  // 红色系
  '#F44336', // 红色
  '#E91E63', // 粉红色
  '#C62828', // 深红色
  '#EF5350', // 亮红色
  '#E57373', // 淡红色
  '#FF8A80', // 珊瑚红
  '#D32F2F', // 酒红色
  
  // 橙色系
  '#FF9800', // 橙色
  '#FF5722', // 深橙色
  '#F57C00', // 深橙色
  '#FFB74D', // 浅橙色
  '#FFCC80', // 蜜桃色
  '#F4511E', // 红橙色
  
  // 黄色系
  '#FFC107', // 琥珀色
  '#FFEB3B', // 黄色
  '#FBC02D', // 深黄色
  '#FFD54F', // 浅黄色
  '#FFF176', // 柠檬黄
  '#FFF59D', // 奶油黄
  '#FFD700', // 金色
  
  // 棕色系
  '#795548', // 棕色
  '#5D4037', // 深棕色
  '#8D6E63', // 浅棕色
  '#A1887F', // 淡棕色
  '#D7CCC8', // 米棕色
  
  // 灰色系
  '#9E9E9E', // 灰色
  '#616161', // 深灰色
  '#757575', // 中灰色
  '#BDBDBD', // 浅灰色
  '#78909C', // 蓝灰色
  '#546E7A', // 深灰蓝
  
  // 粉色系
  '#F06292', // 亮粉色
  '#F48FB1', // 浅粉色
  '#F8BBD9', // 淡粉色
  '#EC407A', // 玫红色
  '#AD1457', // 深粉色
  
  // 其他
  '#00ACC1', // 青色
  '#00897B', // 深青色
  '#C0CA33', // 橄榄绿
  '#AFB42B', // 深橄榄
  '#689F38', // 草绿色
  '#33691E', // 墨绿色
]

/**
 * 从颜色列表中随机获取一个颜色
 * @returns {string} 随机颜色值
 */
export const getRandomWrongBookColor = () => {
  return wrongBookColors[Math.floor(Math.random() * wrongBookColors.length)]
}

/**
 * 生成显示用的颜色列表（随机颜色在最前面）
 * @returns {Object} 包含 randomColor 和 displayColors 的对象
 * @returns {string} return.randomColor - 随机选中的颜色
 * @returns {string[]} return.displayColors - 用于显示的颜色列表（第一个为随机颜色）
 */
export const generateDisplayColorList = () => {
  const randomColor = getRandomWrongBookColor()
  const displayColors = [randomColor, ...wrongBookColors.filter(c => c !== randomColor)]
  
  return {
    randomColor,
    displayColors
  }
}