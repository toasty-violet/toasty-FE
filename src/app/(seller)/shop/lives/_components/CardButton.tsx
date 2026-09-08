"use client";

import type { FC, SVGProps } from "react";

/**
 * 카드 안에 놓이는 작은 버튼.
 * 공통 Button 이 아직 아이콘과 폭을 받지 않아 이 화면에서만 따로 둔다.
 * Button 이 아이콘을 지원하게 되면 그쪽으로 옮긴다.
 */
export function CardButton({
  label,
  icon: Icon,
  tone = "neutral",
  onClick,
}: {
  /** 아이콘만 두는 버튼은 라벨을 접근성용으로만 쓴다. */
  label: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  tone?: "neutral" | "strong";
  onClick?: () => void;
}) {
  const iconOnly = Icon !== undefined && label === "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-8 text-l5-semibold flex h-36 items-center justify-center gap-4 px-16 transition-colors ${
        tone === "strong"
          ? "bg-bg-neutral-strong text-fg-neutral-inverted"
          : "bg-bg-neutral-weak text-fg-neutral-primary"
      } ${iconOnly ? "size-36 shrink-0" : "min-w-0 flex-1"}`}
    >
      {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
      {Icon && <Icon className="size-18 shrink-0 [&_path]:fill-current" />}
      {label && <span className="truncate">{label}</span>}
    </button>
  );
}

/** 아이콘만 있는 정사각 버튼. 라벨은 스크린리더용으로만 쓴다. */
export function IconCardButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-8 bg-bg-neutral-weak text-fg-neutral-primary flex size-36 shrink-0 items-center justify-center transition-colors"
    >
      {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
      <Icon className="size-18 [&_path]:fill-current" />
    </button>
  );
}
