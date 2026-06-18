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

export const getRandomNotebookCardThemes = () => {
  return shuffleArray(notebookCardThemePool).map((theme) => ({
    cardStyle: { ...theme.cardStyle },
    tagStyle: { ...theme.tagStyle },
    auraStyle: { ...theme.auraStyle },
  }));
};
