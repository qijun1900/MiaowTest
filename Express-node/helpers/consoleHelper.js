const ANSI_STYLES = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function canUseAnsi() {
  return Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
}

function paint(text, style) {
  return canUseAnsi() ? `${style}${text}${ANSI_STYLES.reset}` : text;
}

function formatStatusValue(value, tone = "neutral") {
  const text = String(value);

  switch (tone) {
    case "success":
      return paint(text, ANSI_STYLES.green);
    case "warn":
      return paint(text, ANSI_STYLES.yellow);
    case "danger":
      return paint(text, ANSI_STYLES.red);
    default:
      return text;
  }
}

function interpolateColor(startColor, endColor, ratio) {
  return {
    r: Math.round(startColor.r + (endColor.r - startColor.r) * ratio),
    g: Math.round(startColor.g + (endColor.g - startColor.g) * ratio),
    b: Math.round(startColor.b + (endColor.b - startColor.b) * ratio),
  };
}

function applyHorizontalGradient(line, startColor, endColor) {
  const chars = Array.from(line);
  const denominator = Math.max(chars.length - 1, 1);
  const coloredLine = chars
    .map((char, index) => {
      const ratio = index / denominator;
      const color = interpolateColor(startColor, endColor, ratio);
      return `\x1b[38;2;${color.r};${color.g};${color.b}m${char}`;
    })
    .join("");

  return `${coloredLine}${ANSI_STYLES.reset}`;
}

function printInfoSection(title, rows) {
  const maxLabelLength = rows.reduce(
    (max, row) => Math.max(max, row.label.length),
    0,
  );

  console.log(`\n${paint(`✨ ${title}`, ANSI_STYLES.cyan)}`);
  rows.forEach(({ label, value, tone }) => {
    const paddedLabel = label.padEnd(maxLabelLength, " ");
    console.log(
      `   ${paint("•", ANSI_STYLES.cyan)} ${paint(paddedLabel, ANSI_STYLES.dim)} : ${formatStatusValue(value, tone)}`,
    );
  });
}

function printMiaowBanner(bannerLines, options = {}) {
  const lines = Array.isArray(bannerLines) ? bannerLines : [];
  if (!lines.length) {
    return;
  }

  const startColor = options.startColor || { r: 255, g: 113, b: 91 };
  const endColor = options.endColor || { r: 76, g: 201, b: 240 };

  if (!canUseAnsi()) {
    lines.forEach((line) => console.log(line));
    return;
  }

  lines.forEach((line) => {
    console.log(applyHorizontalGradient(line, startColor, endColor));
  });
}

module.exports = {
  ANSI_STYLES,
  canUseAnsi,
  paint,
  formatStatusValue,
  interpolateColor,
  applyHorizontalGradient,
  printInfoSection,
  printMiaowBanner,
};