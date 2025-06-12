// 导入必要的库
import markdownit from 'markdown-it';
import { h } from 'vue';
import { Typography } from 'ant-design-vue';
import markdownItKatex from '@traptitech/markdown-it-katex';  // 新增：用于数学公式支持

// 创建markdownit实例，配置允许HTML标签和自动换行
const md = markdownit({ 
    html: true,
    breaks: true,
    linkify: true
}).use(markdownItKatex, {
    throwOnError: false,  
});

// 导出renderMarkdown函数
export const renderMarkdown = (content) => {
    // 使用Vue的h函数创建Typography组件
    return h(Typography, null, {
        // 默认插槽内容是一个div，其innerHTML设置为markdown渲染后的HTML
        default: () => h('div', { 
            innerHTML: md.render(content),
            class: 'markdown-content'  // 新增：添加样式类
        })
    });
};
