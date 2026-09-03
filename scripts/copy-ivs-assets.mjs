// IVS Player의 wasm worker 에셋을 node_modules에서 public/ivs로 복사합니다.
// 실행: npm run copy:ivs-assets (predev·prebuild에서 자동 실행)
import { cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(
  rootDir,
  "node_modules",
  "amazon-ivs-player",
  "dist",
  "assets",
);
const outDir = path.join(rootDir, "public", "ivs");

const FILES = [
  "amazon-ivs-wasmworker.min.js",
  "amazon-ivs-wasmworker.min.wasm",
];

mkdirSync(outDir, { recursive: true });
for (const file of FILES) {
  cpSync(path.join(srcDir, file), path.join(outDir, file));
}
