// 类型映射方法
import { Memo, Edit, Check ,Document} from '@element-plus/icons-vue'
export const getCategoryName = (val) => {
  const CategoryName = {
    1: '选择类题',
    2: '填空类题',
    3: '判断类题',
    4: '简答类题'
  }
  return CategoryName[val] || '其他类型'
}
//图标
export const getCategoryIcon = (val) => {
  const CategoryIcon = {
    1:Memo,
    2:Edit,
    3:Check,
    4:Document
  }
  return CategoryIcon[val] || '其他类型'
  
}


