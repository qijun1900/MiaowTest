const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const backendRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(backendRoot, "dist");
const outputFile = path.join(outputDir, "backend-no-deps.zip");

fs.mkdirSync(outputDir, { recursive: true });

const output = fs.createWriteStream(outputFile);
const archive = archiver("zip", {
  zlib: { level: 9 },
});

output.on("close", () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`Zip created: ${outputFile}`);
  console.log(`Size: ${sizeMB} MB`);
});

archive.on("warning", (err) => {
  if (err.code === "ENOENT") {
    console.warn(err.message);
    return;
  }
  throw err;
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

archive.glob("**/*", {
  cwd: backendRoot,
  dot: true,
  ignore: [
    "node_modules/**",
    ".env",
    ".env.*",
    "logs/**",
    "dist/**",
    "npm-debug.log*",
  ],
});

archive.finalize();
