// Figma 디자인 토큰(tokens.json)을 Tailwind v4 CSS 변수 + 커스텀 유틸리티로 변환합니다.
// 실행: npm run tokens
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.join(rootDir, "..", "tokens.json");
const outPath = path.join(rootDir, "..", "src", "styles", "tokens.css");

const root = JSON.parse(readFileSync(tokensPath, "utf-8"));

const SETS = [
  "Primitive/Default",
  "Semantic/Light",
  "Radius/Default",
  "Spacing/Default",
];

// 모든 세트를 하나의 참조 테이블로 병합 (Figma 참조 경로는 세트명을 포함하지 않음)
const merged = {};
for (const setName of SETS) {
  Object.assign(merged, root[setName]);
}

function traverse(parts) {
  let node = merged;
  for (const part of parts) node = node[part];
  return node;
}

function resolveLeaf(node) {
  if (typeof node.value === "string" && node.value.startsWith("{")) {
    const parts = node.value.slice(1, -1).split(".");
    return resolveLeaf(traverse(parts));
  }
  return node.value;
}

const FONT_WEIGHT_MAP = {
  Bold: 700,
  SemiBold: 600,
  Medium: 500,
  Regular: 400,
};

function px(n) {
  return `${n}px`;
}
// globals.css의 html { font-size: 62.5% } 기준(1rem = 10px)
function pxToRem(n) {
  return `${n / 10}rem`;
}
function percentToUnitless(percent) {
  return String(parseFloat(percent) / 100);
}
function percentToEm(percent) {
  return `${parseFloat(percent) / 100}em`;
}

// ---- Colors (Primitive + Semantic) ----
const colorVars = [];
for (const group of [
  "gray",
  "brand",
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
]) {
  for (const [shade, node] of Object.entries(merged[group])) {
    colorVars.push([`--color-${group}-${shade}`, resolveLeaf(node)]);
  }
}
for (const [name, node] of Object.entries(merged.static)) {
  colorVars.push([`--color-static-${name}`, resolveLeaf(node)]);
}
for (const [name, node] of Object.entries(merged.alpha)) {
  colorVars.push([`--color-alpha-${name}`, resolveLeaf(node)]);
}
for (const group of ["fg", "bg", "stroke"]) {
  for (const [name, node] of Object.entries(merged[group])) {
    colorVars.push([`--color-${group}-${name}`, resolveLeaf(node)]);
  }
}

// ---- Radius ----
const radiusVars = [];
for (const [name, node] of Object.entries(merged.radius)) {
  radiusVars.push([`--radius-${name}`, pxToRem(resolveLeaf(node))]);
}

// ---- Spacing ----
const spacingVars = [];
for (const [name, node] of Object.entries(merged.spacing)) {
  spacingVars.push([`--spacing-${name}`, pxToRem(resolveLeaf(node))]);
}

// ---- Font family ----
// next/font/local이 layout.tsx에서 --font-pretendard-local로 실제 패밀리를 주입합니다.
const fontVars = [];
for (const [name] of Object.entries(merged.fontFamilies)) {
  fontVars.push([`--font-${name}`, `var(--font-${name}-local), sans-serif`]);
}

// ---- Typography utilities ----
const TYPOGRAPHY_GROUPS = [
  "Heading",
  "Title",
  "Subtitle",
  "Body",
  "Caption",
  "Label",
];
const typographyStyles = [];
for (const group of TYPOGRAPHY_GROUPS) {
  for (const [name, node] of Object.entries(merged[group])) {
    const v = node.value;
    const fontFamilyName = v.fontFamily
      .slice(1, -1)
      .split(".")
      .pop()
      .toLowerCase();
    const weightName = resolveLeaf(
      traverse(v.fontWeight.slice(1, -1).split(".")),
    );
    const fontSizePx = resolveLeaf(
      traverse(v.fontSize.slice(1, -1).split(".")),
    );
    const lineHeightPct = resolveLeaf(
      traverse(v.lineHeight.slice(1, -1).split(".")),
    );
    const letterSpacingPct = resolveLeaf(
      traverse(v.letterSpacing.slice(1, -1).split(".")),
    );

    typographyStyles.push({
      name,
      fontFamily: `var(--font-${fontFamilyName})`,
      fontWeight: FONT_WEIGHT_MAP[weightName],
      fontSize: pxToRem(fontSizePx),
      lineHeight: percentToUnitless(lineHeightPct),
      letterSpacing: percentToEm(letterSpacingPct),
    });
  }
}

// ---- Emit CSS ----
const lines = [];
lines.push("/* 자동 생성 파일입니다. 직접 수정하지 마세요. */");
lines.push("/* 소스: tokens.json — 재생성: npm run tokens */");
lines.push("");
lines.push(":root {");
for (const [name, value] of [
  ...colorVars,
  ...radiusVars,
  ...spacingVars,
  ...fontVars,
]) {
  lines.push(`  ${name}: ${value};`);
}
lines.push("}");
lines.push("");
lines.push("@theme inline {");
for (const [name] of [
  ...colorVars,
  ...radiusVars,
  ...spacingVars,
  ...fontVars,
]) {
  lines.push(`  ${name}: var(${name});`);
}
lines.push("}");
lines.push("");
for (const style of typographyStyles) {
  lines.push(`@utility text-${style.name} {`);
  lines.push(`  font-family: ${style.fontFamily};`);
  lines.push(`  font-weight: ${style.fontWeight};`);
  lines.push(`  font-size: ${style.fontSize};`);
  lines.push(`  line-height: ${style.lineHeight};`);
  lines.push(`  letter-spacing: ${style.letterSpacing};`);
  lines.push(`}`);
  lines.push("");
}

writeFileSync(outPath, lines.join("\n"));
console.log(`Generated ${path.relative(process.cwd(), outPath)}`);
