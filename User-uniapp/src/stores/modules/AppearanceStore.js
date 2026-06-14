import { ref, computed } from "vue";
import { defineStore } from "pinia";

/**
 * 外观设置 store
 *
 * 主题模型：preset × mode
 *   - themePreset: 'aurora' | 'claude'
 *   - darkMode:    'auto'   | 'light' | 'dark'
 *
 * 实际生效的样式作用于根节点的 class：`theme-<preset> mode-<resolvedMode>`
 * H5 直接写到 documentElement，小程序通过 ThemeProvider 注入到页面根 view。
 */

const THEME_PRESETS = [
    {
        key: "aurora",
        name: "极光蓝",
        description: "经典清爽的浅蓝主题",
        primary: "#0052d9",
    },
    {
        key: "claude",
        name: "Claude",
        description: "类 Claude 应用的暖橙纸质风格",
        primary: "#c96442",
    },
];

const isValidPreset = (key) => THEME_PRESETS.some((p) => p.key === key);

// 兼容旧持久化：把旧版本里存的"主题色十六进制"映射到新预设
const legacyColorToPreset = (color) => {
    if (!color) return "aurora";
    const c = String(color).toLowerCase();
    if (c === "#c96442" || c === "#d97757") return "claude";
    return "aurora";
};

export const AppearanceStore = defineStore(
    "appearance",
    () => {
        // ── 状态 ──────────────────────────────────────────────────────────────
        const themePreset = ref("aurora");
        const darkMode = ref("auto"); // 'auto' | 'light' | 'dark'
        const fontSizeIndex = ref(1); // 0=小 1=中 2=大
        const fontSizeScale = ref(1);

        // 旧字段：保留以兼容仍引用 appearanceStore.themeColor 的旧代码
        const themeColor = computed(
            () => getPresetByKey(themePreset.value)?.primary || "#0052d9"
        );

        const themePresets = THEME_PRESETS;
        const fontSizeOptions = ["小", "中", "大"];
        const fontSizeScales = [0.85, 1, 1.15];

        // ── 工具 ──────────────────────────────────────────────────────────────
        const getPresetByKey = (key) =>
            THEME_PRESETS.find((p) => p.key === key) || THEME_PRESETS[0];

        /**
         * 解析最终生效的 light / dark 模式
         */
        const resolveMode = () => {
            if (darkMode.value !== "auto") return darkMode.value;
            // #ifdef H5
            if (
                typeof window !== "undefined" &&
                window.matchMedia
            ) {
                try {
                    return window.matchMedia("(prefers-color-scheme: dark)")
                        .matches
                        ? "dark"
                        : "light";
                } catch (_) {
                    return "light";
                }
            }
            // #endif
            // #ifndef H5
            try {
                const theme = uni.getSystemInfoSync()?.theme;
                if (theme === "dark") return "dark";
            } catch (_) {}
            // #endif
            return "light";
        };

        // ── 应用变更 ──────────────────────────────────────────────────────────
        /**
         * 统一应用主题：
         *   - H5：写到 documentElement.className 让 :root 选择器生效
         *   - 小程序/APP：通过事件总线广播，由 ThemeProvider 注入根 view class
         */
        const applyTheme = () => {
            const preset = isValidPreset(themePreset.value)
                ? themePreset.value
                : "aurora";
            const mode = resolveMode();
            const themeClass = `theme-${preset}`;
            const modeClass = `mode-${mode}`;

            // #ifdef H5
            if (typeof document !== "undefined") {
                const el = document.documentElement;
                el.classList.remove(
                    "theme-aurora",
                    "theme-claude",
                    "mode-light",
                    "mode-dark"
                );
                el.classList.add(themeClass, modeClass);
                el.style.setProperty(
                    "--app-font-size-scale",
                    String(fontSizeScale.value)
                );
            }
            // #endif

            // 通知 ThemeProvider 与可能的订阅者（小程序、APP、H5 皆触发）
            try {
                uni.$emit("app:theme-change", {
                    preset,
                    mode,
                    fontScale: fontSizeScale.value,
                });
            } catch (_) {}
        };

        // ── 公共 setter ───────────────────────────────────────────────────────
        const setThemePreset = (key) => {
            if (!isValidPreset(key)) return;
            themePreset.value = key;
            applyTheme();
        };

        const setDarkMode = (mode) => {
            if (!["auto", "light", "dark"].includes(mode)) return;
            darkMode.value = mode;
            applyTheme();
        };

        const setFontSize = (index) => {
            const safeIndex = Math.max(
                0,
                Math.min(fontSizeScales.length - 1, index)
            );
            fontSizeIndex.value = safeIndex;
            fontSizeScale.value = fontSizeScales[safeIndex];
            applyTheme();
        };

        /**
         * 旧 API 兼容：之前页面调 setThemeColor('#xxxxxx')。
         * 内部映射到对应预设，避免历史数据/老页面报错。
         */
        const setThemeColor = (color) => {
            setThemePreset(legacyColorToPreset(color));
        };

        const getDarkModeText = () => {
            const map = { auto: "跟随系统", light: "浅色", dark: "深色" };
            return map[darkMode.value] || "跟随系统";
        };

        const getCurrentPreset = () => getPresetByKey(themePreset.value);

        // ── 初始化 ────────────────────────────────────────────────────────────
        const initAppearance = () => {
            // 兼容旧持久化：旧版本只存了 themeColor，没有 themePreset
            if (!isValidPreset(themePreset.value)) {
                themePreset.value = "aurora";
            }
            fontSizeScale.value =
                fontSizeScales[fontSizeIndex.value] || 1;

            applyTheme();

            // 监听系统深浅变化（仅 auto 模式下才需要重算）
            // #ifdef H5
            if (
                typeof window !== "undefined" &&
                window.matchMedia
            ) {
                try {
                    const mq = window.matchMedia(
                        "(prefers-color-scheme: dark)"
                    );
                    const handler = () => {
                        if (darkMode.value === "auto") applyTheme();
                    };
                    mq.addEventListener?.("change", handler);
                } catch (_) {}
            }
            // #endif
            // #ifndef H5
            try {
                uni.onThemeChange?.(() => {
                    if (darkMode.value === "auto") applyTheme();
                });
            } catch (_) {}
            // #endif
        };

        return {
            // state
            themePreset,
            themeColor, // 旧字段（computed），仅向后兼容
            darkMode,
            fontSizeIndex,
            fontSizeScale,
            // options
            themePresets,
            fontSizeOptions,
            fontSizeScales,
            // setters
            setThemePreset,
            setThemeColor, // 旧 API
            setDarkMode,
            setFontSize,
            // getters
            getDarkModeText,
            getCurrentPreset,
            // lifecycle
            initAppearance,
            applyTheme,
            resolveMode,
        };
    },
    {
        persist: {
            // 只持久化用户偏好，不持久化 computed
            paths: ["themePreset", "darkMode", "fontSizeIndex"],
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
