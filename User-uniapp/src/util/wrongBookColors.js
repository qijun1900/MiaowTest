// 错题本颜色配置 - 筛选与白色标题对比度清晰的颜色
export const wrongBookColors = [
  // 深绿色系
  '#2E7D32', // 深绿色
  '#1B5E20', // 墨绿色
  '#33691E', // 暗绿色
  '#00695C', // 深青色
  '#00796B', // 深青绿
  
  // 深蓝色系
  '#1565C0', // 深蓝色
  '#0D47A1', // 暗蓝色
  '#283593', // 靛蓝
  '#1A237E', // 深靛蓝
  '#0277BD', // 深天蓝
  '#01579B', // 深海蓝
  '#006064', // 深青
  
  // 深紫色系
  '#6A1B9A', // 深紫色
  '#4A148C', // 暗紫色
  '#4527A0', // 深紫罗兰
  '#311B92', // 暗紫罗兰
  '#7B1FA2', // 深紫红
  
  // 深红色系
  '#C62828', // 深红色
  '#B71C1C', // 暗红色
  '#AD1457', // 深粉色
  '#880E4F', // 暗粉色
  '#D32F2F', // 酒红色
  
  // 深橙色系
  '#E65100', // 深橙色
  '#EF6C00', // 暗橙色
  '#F57C00', // 深橘色
  '#FF6F00', // 琥珀深橙
  '#F4511E', // 深红橙
  
  // 深棕色系
  '#5D4037', // 深棕色
  '#4E342E', // 暗棕色
  '#3E2723', // 咖啡色
  '#795548', // 中棕色
  
  // 深灰色系
  '#424242', // 深灰色
  '#37474F', // 蓝灰色
  '#455A64', // 深灰蓝
  '#263238', // 暗灰蓝
  
  // 其他深色
  '#827717', // 深橄榄
  '#558B2F', // 深草绿
  '#AFB42B', // 橄榄黄
  '#9E9D24', // 深柠檬
  '#F9A825', // 深金黄
  '#FBC02D', // 深黄色（勉强可用）
  '#F57F17', // 深琥珀
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