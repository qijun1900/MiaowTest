// 错题本颜色配置 - 筛选与白色标题对比度清晰的颜色
export const wrongBookColors = [
  // 深绿色系
  "#2E7D32", // 深绿色
  "#1B5E20", // 墨绿色
  "#33691E", // 暗绿色
  "#00695C", // 深青色
  "#00796B", // 深青绿

  // 深蓝色系
  "#1565C0", // 深蓝色
  "#0D47A1", // 暗蓝色
  "#283593", // 靛蓝
  "#1A237E", // 深靛蓝
  "#0277BD", // 深天蓝
  "#01579B", // 深海蓝
  "#006064", // 深青

  // 深紫色系
  "#6A1B9A", // 深紫色
  "#4A148C", // 暗紫色
  "#4527A0", // 深紫罗兰
  "#311B92", // 暗紫罗兰
  "#7B1FA2", // 深紫红

  // 深红色系
  "#C62828", // 深红色
  "#B71C1C", // 暗红色
  "#AD1457", // 深粉色
  "#880E4F", // 暗粉色
  "#D32F2F", // 酒红色

  // 深橙色系
  "#E65100", // 深橙色
  "#EF6C00", // 暗橙色
  "#F57C00", // 深橘色
  "#FF6F00", // 琥珀深橙
  "#F4511E", // 深红橙

  // 深棕色系
  "#5D4037", // 深棕色
  "#4E342E", // 暗棕色
  "#3E2723", // 咖啡色
  "#795548", // 中棕色

  // 深灰色系
  "#424242", // 深灰色
  "#37474F", // 蓝灰色
  "#455A64", // 深灰蓝
  "#263238", // 暗灰蓝

  // 其他深色
  "#827717", // 深橄榄
  "#558B2F", // 深草绿
  "#AFB42B", // 橄榄黄
  "#9E9D24", // 深柠檬
  "#F9A825", // 深金黄
  "#FBC02D", // 深黄色（勉强可用）
  "#F57F17", // 深琥珀
];

const notebookCardThemePool = [
  {
    cardStyle: {
      borderColor: "#dce3f4",
      background: "linear-gradient(145deg, #ffffff 0%, #f7f9ff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(70, 90, 132, 0.13)",
    },
    tagStyle: {
      background: "#eaf0ff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(111, 135, 255, 0.16) 0%, rgba(111, 135, 255, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#dbe6fb",
      background: "linear-gradient(145deg, #ffffff 0%, #f2f8ff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(67, 107, 169, 0.14)",
    },
    tagStyle: {
      background: "#e5f0ff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(82, 143, 255, 0.2) 0%, rgba(82, 143, 255, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#e0e3f8",
      background: "linear-gradient(145deg, #ffffff 0%, #f8f8ff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(96, 96, 162, 0.12)",
    },
    tagStyle: {
      background: "#ecebff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(143, 120, 255, 0.16) 0%, rgba(143, 120, 255, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#e5e8f7",
      background: "linear-gradient(145deg, #ffffff 0%, #f5f7ff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(88, 102, 150, 0.12)",
    },
    tagStyle: {
      background: "#edf1ff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(124, 137, 255, 0.18) 0%, rgba(124, 137, 255, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#d8e9f7",
      background: "linear-gradient(145deg, #ffffff 0%, #f2faff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(60, 128, 170, 0.13)",
    },
    tagStyle: {
      background: "#e8f5ff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(74, 164, 228, 0.18) 0%, rgba(74, 164, 228, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#e8e2f7",
      background: "linear-gradient(145deg, #ffffff 0%, #faf6ff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(122, 94, 167, 0.12)",
    },
    tagStyle: {
      background: "#f2ecff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(168, 126, 245, 0.16) 0%, rgba(168, 126, 245, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#e9e4f9",
      background: "linear-gradient(145deg, #ffffff 0%, #f9f6ff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(102, 108, 176, 0.12)",
    },
    tagStyle: {
      background: "#f1eeff",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(136, 146, 255, 0.16) 0%, rgba(136, 146, 255, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#f0e4f2",
      background: "linear-gradient(145deg, #ffffff 0%, #fff7fd 85%)",
      boxShadow: "0 14rpx 34rpx rgba(150, 96, 138, 0.11)",
    },
    tagStyle: {
      background: "#faecf7",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(221, 128, 194, 0.15) 0%, rgba(221, 128, 194, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#f2e8e1",
      background: "linear-gradient(145deg, #ffffff 0%, #fff8f2 85%)",
      boxShadow: "0 14rpx 34rpx rgba(159, 112, 84, 0.11)",
    },
    tagStyle: {
      background: "#fdf1e8",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(234, 163, 111, 0.15) 0%, rgba(234, 163, 111, 0) 65%)",
    },
  },
  {
    cardStyle: {
      borderColor: "#e2edf2",
      background: "linear-gradient(145deg, #ffffff 0%, #f4fbff 85%)",
      boxShadow: "0 14rpx 34rpx rgba(86, 127, 146, 0.11)",
    },
    tagStyle: {
      background: "#eaf6fc",
    },
    auraStyle: {
      background:
        "radial-gradient(circle at center, rgba(121, 183, 215, 0.15) 0%, rgba(121, 183, 215, 0) 65%)",
    },
  },
];

const shuffleArray = (arr = []) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * 从颜色列表中随机获取一个颜色
 * @returns {string} 随机颜色值
 */
export const getRandomWrongBookColor = () => {
  return wrongBookColors[Math.floor(Math.random() * wrongBookColors.length)];
};

/**
 * 生成显示用的颜色列表（随机颜色在最前面）
 * @returns {{ randomColor: string, displayColors: string[] }}
 */
export const generateDisplayColorList = () => {
  const randomColor = getRandomWrongBookColor();
  const displayColors = [
    randomColor,
    ...wrongBookColors.filter((c) => c !== randomColor),
  ];

  return {
    randomColor,
    displayColors,
  };
};

/**
 * 获取随机顺序的笔记本卡片主题
 * @returns {{cardStyle: object, tagStyle: object, auraStyle: object}[]}
 */
export const getRandomNotebookCardThemes = () => {
  return shuffleArray(notebookCardThemePool).map((theme) => ({
    cardStyle: { ...theme.cardStyle },
    tagStyle: { ...theme.tagStyle },
    auraStyle: { ...theme.auraStyle },
  }));
};
