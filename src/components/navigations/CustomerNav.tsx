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
    <nav className="bg-gray-00 flex h-[6.6rem] w-full items-center border-t border-gray-300 px-20">
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
  );
}
