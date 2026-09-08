"use client";

import type { FC, SVGProps } from "react";

const BASE =
  "rounded-8 text-l5-semibold flex h-36 items-center justify-center gap-4 transition-colors";

const TONE = {
  neutral: "bg-bg-neutral-weak text-fg-neutral-primary",
  strong: "bg-bg-neutral-strong text-fg-neutral-inverted",
};

/**
 * 카드 안에 놓이는 아이콘 달린 작은 버튼.
 * 공통 Button 의 sm 과 같은 모양인데 Button 이 아직 아이콘을 받지 않아 여기 둔다.
 * Button 이 아이콘을 지원하게 되면 그쪽으로 옮긴다.
 */
export function CardButton({
  label,
  icon: Icon,
  tone = "neutral",
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  tone?: keyof typeof TONE;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BASE} ${TONE[tone]} min-w-0 flex-1 px-16`}
    >
      {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
      <Icon className="size-18 shrink-0 [&_path]:fill-current" />
      <span className="truncate">{label}</span>
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
      className={`${BASE} ${TONE.neutral} size-36 shrink-0`}
    >
      <Icon className="size-18 [&_path]:fill-current" />
    </button>
  );
}
