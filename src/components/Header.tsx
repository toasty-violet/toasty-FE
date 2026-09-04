"use client";

import type { FC, SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BackIcon from "@/assets/Back.svg";
import MoreIcon from "@/assets/More.svg";
import SearchIcon from "@/assets/Search.svg";
import ShareIcon from "@/assets/Share.svg";

type SvgIcon = FC<SVGProps<SVGSVGElement>>;

const RIGHT_ICONS = {
  more: MoreIcon,
  search: SearchIcon,
  share: ShareIcon,
} satisfies Record<string, SvgIcon>;

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  /** 우측 아이콘. rightHref와 함께 지정해야 렌더링됩니다. */
  rightIconName?: keyof typeof RIGHT_ICONS;
  /** 우측 아이콘을 눌렀을 때 이동할 경로. */
  rightHref?: string;
  /** 우측 버튼의 접근성 레이블. */
  rightLabel?: string;
};

export function Header({
  title,
  showBack = true,
  rightIconName,
  rightHref,
  rightLabel,
}: HeaderProps) {
  const router = useRouter();
  const RightIcon = rightIconName && RIGHT_ICONS[rightIconName];

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

      {title && (
        <h1 className="text-st1-semibold text-fg-neutral-solid absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          {title}
        </h1>
      )}

      {RightIcon && rightHref && (
        <Link
          href={rightHref}
          aria-label={rightLabel}
          className="absolute top-1/2 right-20 -translate-y-1/2"
        >
          <RightIcon className="size-24" />
        </Link>
      )}
    </header>
  );
}
