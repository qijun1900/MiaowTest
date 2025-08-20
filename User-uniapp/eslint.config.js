import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // 添加uni-app全局变量
        uni: 'readonly',
        wx: 'readonly',
        getCurrentPages: 'readonly',
        getApp: 'readonly',
        plus: 'readonly',
        uniCloud: 'readonly',
        App: 'readonly',
        Page: 'readonly',
        Component: 'readonly',
        Behavior: 'readonly',
        process: 'readonly'
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  // 新增规则覆盖，关闭特定规则
  {
    rules: {
      'vue/multi-word-component-names': 'off', // 关闭组件名必须多单词的限制
      'vue/valid-template-root': 'off',        // 关闭模板必须单根元素的限制
    },
  },
])