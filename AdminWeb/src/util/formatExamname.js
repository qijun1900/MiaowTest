// 类型映射方法
const getCategoryName = (val) => {
  const CategoryName = {
    1: '选择类题',
    2: '填空类题',
    3: '判断类题',
    4: '简答类题'
  }
  return CategoryName[val] || '其他类型'
}
export default getCategoryName;