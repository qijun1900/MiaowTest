// 错题本颜色配置 - 筛选与白色标题对比度清晰的颜色
export const wrongBookColors = [
  // 深绿色系
  "#2E7D32",
  "#1B5E20",
  "#33691E",
  "#00695C",
  "#00796B",

  // 深蓝色系
  "#1565C0",
  "#0D47A1",
  "#283593",
  "#1A237E",
  "#0277BD",
  "#01579B",
  "#006064",

  // 深紫色系
  "#6A1B9A",
  "#4A148C",
  "#4527A0",
  "#311B92",
  "#7B1FA2",

  // 深红色系
  "#C62828",
  "#B71C1C",
  "#AD1457",
  "#880E4F",
  "#D32F2F",

  // 深橙色系
  "#E65100",
  "#EF6C00",
  "#F57C00",
  "#FF6F00",
  "#F4511E",

  // 深棕色系
  "#5D4037",
  "#4E342E",
  "#3E2723",
  "#795548",

  // 深灰色系
  "#424242",
  "#37474F",
  "#455A64",
  "#263238",

  // 其他深色
  "#827717",
  "#558B2F",
  "#AFB42B",
  "#9E9D24",
  "#F9A825",
  "#FBC02D",
  "#F57F17",
];

export const getRandomWrongBookColor = () => {
  return wrongBookColors[Math.floor(Math.random() * wrongBookColors.length)];
};

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
