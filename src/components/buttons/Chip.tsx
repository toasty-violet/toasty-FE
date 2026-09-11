"use client";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const SELECTED_BG = "#2a3038"; // bg/neutral-solid-muted
const LABEL = "#5b606b"; // fg/neutral-weak

/** 목록 위에 놓여 한 가지를 고르는 칩. 고른 것만 채워진다. */
export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={selected ? { backgroundColor: SELECTED_BG } : { color: LABEL }}
      className={`text-l4-medium flex h-36 shrink-0 items-center justify-center rounded-full px-16 ${
        selected
          ? "text-fg-neutral-inverted"
          : "border-stroke-neutral-weak border"
      }`}
    >
      {label}
    </button>
  );
}
