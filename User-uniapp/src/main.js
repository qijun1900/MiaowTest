import { createSSRApp } from "vue";
import App from "./App.vue";
//导入piania
import pinia from "./stores/index";
//tdesign组件项目地址 Link:https://tdesign.tencent.com/uniapp
//uni-ui组件地址 Link:https://uniapp.dcloud.io/quickstart


// 兼容部分 App 运行环境不支持 Array/String.prototype.at 的情况
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", {
    value(index) {
      const len = this.length;
      const i = Number(index) || 0;
      const normalized = i >= 0 ? i : len + i;
      if (normalized < 0 || normalized >= len) return undefined;
      return this[normalized];
    },
    writable: true,
    configurable: true,
  });
}

if (!String.prototype.at) {
  Object.defineProperty(String.prototype, "at", {
    value(index) {
      const str = String(this);
      const len = str.length;
      const i = Number(index) || 0;
      const normalized = i >= 0 ? i : len + i;
      if (normalized < 0 || normalized >= len) return undefined;
      return str.charAt(normalized);
    },
    writable: true,
    configurable: true,
  });
}

export function createApp() {
  const app = createSSRApp(App);

  //注册pinia
  app.use(pinia);
  return {
    app,
  };
}
