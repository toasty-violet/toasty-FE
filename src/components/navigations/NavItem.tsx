import Link from "next/link";
import type { FC, SVGProps } from "react";

type NavItemProps = {
  href: string;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  activeIcon: FC<SVGProps<SVGSVGElement>>;
  active?: boolean;
};

//네비게이션 요소 ex) 홈 아이콘과 "홈" 글자
export function NavItem({
  href,
  label,
  icon: Icon,
  activeIcon: ActiveIcon,
  active = false,
}: NavItemProps) {
  const CurrentIcon = active ? ActiveIcon : Icon;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="flex flex-1 flex-col items-center gap-6"
    >
      <CurrentIcon className="size-24" aria-hidden />
      <span
        className={`text-center ${
          active
            ? "text-l5-bold text-fg-neutral-strong"
            : "text-l5-semibold text-fg-neutral-placeholder"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
