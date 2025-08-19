export const getWelcomdescription = (val) => {
  const CategoryName = {
    1: '',
    2: '',
    3: '',
    4: ''
  }
  return CategoryName[val] || '其他类型'
}