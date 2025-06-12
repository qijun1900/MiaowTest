<template>
    <router-view />
</template>

<style lang="scss">
// 新增：引入katex样式

* {
  margin: 0;
  padding: 0;
}
/* 数学公式样式 */
.markdown-content {
  line-height: 1.6;
}

.markdown-content p {
  margin: 0.8em 0;
}

.markdown-content .katex {
  font-size: 1.1em;
}

/* 代码块样式 */
.markdown-content pre {
  background: #f5f5f5;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

</style>
