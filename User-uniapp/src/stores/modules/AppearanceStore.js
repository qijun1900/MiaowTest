import { ref } from "vue";
import { defineStore } from "pinia";

export const AppearanceStore = defineStore(
    "appearance",
    () => {
        // 深浅模式: 'auto' | 'light' | 'dark'
        const darkMode = ref("auto");
        // 主题色
        const themeColor = ref("#2979ff");
        // 字号索引: 0=小, 1=中, 2=大
        const fontSizeIndex = ref(1);
        // 字号缩放比例
        const fontSizeScale = ref(1);

        // 预设主题色
        const themeColors = [
            { name: "极光蓝", color: "#2979ff" },
            { name: "薄荷绿", color: "#19be6b" },
            { name: "珊瑚橙", color: "#ff9900" },
            { name: "樱花粉", color: "#fa3534" },
            { name: "梦幻紫", color: "#a066d6" },
            { name: "深邃黑", color: "#333333" },
        ];

        // 预设字号
        const fontSizeOptions = ["小", "中", "大"];
        const fontSizeScales = [0.85, 1, 1.15];

        // 设置深浅模式
        const setDarkMode = (mode) => {
            darkMode.value = mode;
            applyDarkMode(mode);
        };

        // 设置主题色
        const setThemeColor = (color) => {
            themeColor.value = color;
            applyThemeColor(color);
        };

        // 设置字号
        const setFontSize = (index) => {
            fontSizeIndex.value = index;
            fontSizeScale.value = fontSizeScales[index];
            applyFontSize(fontSizeScales[index]);
        };

        // 应用深浅模式
        const applyDarkMode = (mode) => {
            // #ifdef H5
            const html = document.documentElement;
            if (mode === "dark") {
                html.setAttribute("data-theme", "dark");
            } else if (mode === "light") {
                html.setAttribute("data-theme", "light");
            } else {
                // auto — 跟随系统
                const prefersDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;
                html.setAttribute("data-theme", prefersDark ? "dark" : "light");
            }
            // #endif
            // #ifdef MP-WEIXIN
            // 小程序端通过 wx.setEnablePageDarkMode 或样式变量处理
            try {
                wx.setEnablePageDarkMode?.({ enable: mode !== "light" });
            } catch (_) {}
            // #endif
        };

        // 应用主题色
        const applyThemeColor = (color) => {
            // #ifdef H5
            document.documentElement.style.setProperty(
                "--app-theme-color",
                color
            );
            // #endif
        };

        // 应用字号
        const applyFontSize = (scale) => {
            // #ifdef H5
            document.documentElement.style.setProperty(
                "--app-font-size-scale",
                scale
            );
            // #endif
        };

        // 获取深浅模式文本
        const getDarkModeText = () => {
            const map = { auto: "跟随系统", light: "浅色", dark: "深色" };
            return map[darkMode.value] || "跟随系统";
        };

        // 获取当前主题色对象
        const getCurrentTheme = () => {
            return (
                themeColors.find((t) => t.color === themeColor.value) ||
                themeColors[0]
            );
        };

        // 初始化时应用已保存的设置
        const initAppearance = () => {
            applyDarkMode(darkMode.value);
            applyThemeColor(themeColor.value);
            fontSizeScale.value = fontSizeScales[fontSizeIndex.value] || 1;
            applyFontSize(fontSizeScale.value);
        };

        return {
            darkMode,
            themeColor,
            fontSizeIndex,
            fontSizeScale,
            themeColors,
            fontSizeOptions,
            fontSizeScales,
            setDarkMode,
            setThemeColor,
            setFontSize,
            getDarkModeText,
            getCurrentTheme,
            initAppearance,
        };
    },
    {
        persist: {
            storage: {
                getItem(key) {
                    return typeof window !== "undefined"
                        ? localStorage.getItem(key)
                        : uni.getStorageSync(key);
                },
                setItem(key, value) {
                    return typeof window !== "undefined"
                        ? localStorage.setItem(key, value)
                        : uni.setStorageSync(key, value);
                },
            },
        },
    }
);
