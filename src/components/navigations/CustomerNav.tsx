"use client";

import { usePathname } from "next/navigation";

import { NavItem } from "./NavItem";
import HomeBlank from "./assets/HomeBlank.svg";
import HomeFilled from "./assets/HomeFilled.svg";
import MyBlank from "./assets/MyBlank.svg";
import MyFilled from "./assets/MyFilled.svg";
import OrderBlank from "./assets/OrderBlank.svg";
import OrderFilled from "./assets/OrderFilled.svg";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: HomeBlank, activeIcon: HomeFilled },
  { href: "/orders", label: "주문", icon: OrderBlank, activeIcon: OrderFilled },
  { href: "/me", label: "마이", icon: MyBlank, activeIcon: MyFilled },
];

//구매자용 네비게이션
export function CustomerNav() {
  const pathname = usePathname();

  return (
    // 스크롤을 따라 밀리지 않도록 프레임 아래에 붙이고, 본문이 가려지지 않게 같은 높이를 자리로 남긴다.
    <div className="h-[6.6rem] shrink-0">
      <nav className="bg-gray-00 absolute inset-x-0 bottom-0 z-10 flex h-[6.6rem] w-full items-center border-t border-gray-300 px-20">
        {NAV_ITEMS.map(({ href, label, icon, activeIcon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            activeIcon={activeIcon}
            active={href === "/" ? pathname === "/" : pathname.startsWith(href)}
          />
        ))}
      </nav>
    </div>
  );
}
