import markdownit from 'markdown-it';
import { h } from 'vue';
import { Typography } from 'ant-design-vue';

const md = markdownit({ html: true, breaks: true });

export const renderMarkdown = (content) => {
    return h(Typography, null, {
        default: () => h('div', { 
            innerHTML: md.render(content),
            class: 'markdown-content'
        })
    });
};
