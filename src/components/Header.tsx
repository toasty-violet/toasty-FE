"use client";

import type { FC, SVGProps } from "react";
import { useRouter } from "next/navigation";

import BackIcon from "@/assets/Back.svg";

type SvgIcon = FC<SVGProps<SVGSVGElement>>;

type HeaderProps = {
  title: string;
  showBack?: boolean;
  /** 우측 버튼 아이콘. SVGR로 import한 svg 컴포넌트를 전달합니다. */
  rightIcon?: SvgIcon;
  onRightClick?: () => void;
  /** 우측 버튼의 접근성 레이블. */
  rightLabel?: string;
};

export function Header({
  title,
  showBack = true,
  rightIcon: RightIcon,
  onRightClick,
  rightLabel,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-bg-layer-default relative h-[5rem] w-full">
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="absolute top-1/2 left-20 -translate-y-1/2"
        >
          <BackIcon className="size-24" />
        </button>
      )}

      <h1 className="text-st1-semibold text-fg-neutral-solid absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
        {title}
      </h1>

      {RightIcon && (
        <button
          type="button"
          onClick={onRightClick}
          aria-label={rightLabel}
          className="absolute top-1/2 right-20 -translate-y-1/2"
        >
          <RightIcon className="size-24" />
        </button>
      )}
    </header>
  );
}
