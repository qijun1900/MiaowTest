import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const serverHost = env.VITE_SERVER_HOST || "localhost";
  const serverPort = env.VITE_SERVER_PORT || "3000";

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      // 生产环境移除 console 和 debugger
      minify: "esbuild",
      esbuild: {
        drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
      },
    },
    server: {
      proxy: {
        "/adminapi": {
          target: `http://${serverHost}:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
