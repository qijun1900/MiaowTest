# 替换MyNoteDetailView中的编辑器组件

## 1. 组件引入替换

* 将原有的`uniEditor`组件引入替换为`sp-editor`组件

* 移除`uniEditor`的import语句

* 添加`sp-editor`的import语句

## 2. 组件标签替换

* 将`<uniEditor>`标签替换为`<sp-editor>`标签

* 调整组件属性，确保与sp-editor组件的API兼容

## 3. 数据绑定适配

* 确保`v-model`绑定正常工作

* 调整编辑器内容的获取和设置方式

## 4. 样式调整

* 确保sp-editor组件在弹窗中正常显示

* 调整编辑器高度和其他样式属性

## 5. 功能验证

* 确保编辑器可以正常输入和保存

* 验证工具栏功能正常工作

* 确保笔记内容可以正确保存到后端

## 具体修改点

### 1. 修改组件引入

在`MyNoteDetailView.vue`文件中：

* 移除：`import uniEditor from '../../components/core/uniEditor.vue';`

* 无需添加sp-editor的import语句，因为uni\_modules组件会自动注册

### 2. 修改组件使用

将：

```vue
<uniEditor 
    placeholder="请在此处输入笔记内容..." 
    v-model="noteContent" 
    height="300rpx"
    id="noteEditor" />
```

替换为：

```vue
<sp-editor 
    :placeholder="'请在此处输入笔记内容...'" 
    :toolbar-config="toolbarConfig"
    @input="handleEditorInput"
    @init="handleEditorInit"
    id="noteEditor" />
```

### 3. 添加必要的方法和数据

* 添加`toolbarConfig`数据，配置工具栏

* 添加`handleEditorInput`方法，处理编辑器输入事件

* 添加`handleEditorInit`方法，处理编辑器初始化事件

* 添加`editorCtx`数据，保存编辑器上下文

### 4. 调整保存逻辑

* 在`handleSaveNote`方法中，使用sp-editor的方式获取编辑器内容

* 确保笔记内容可以正确保存

### 5. 调整样式

* 调整编辑器容器的样式

* 确保编辑器在弹窗中正常显示

## 预期效果

* 编辑器组件成功替换为sp-editor

* 编辑器功能正常，包括输入、格式化、保存等

