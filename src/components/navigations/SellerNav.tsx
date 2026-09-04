"use client";

import { usePathname } from "next/navigation";

import { NavItem } from "./NavItem";
import LiveBlank from "./assets/LiveBlank.svg";
import LiveFilled from "./assets/LiveFilled.svg";
import OrderBlank from "./assets/OrderBlank.svg";
import OrderFilled from "./assets/OrderFilled.svg";
import ProductBlank from "./assets/ProductBlank.svg";
import ProductFilled from "./assets/ProductFilled.svg";
import StoreBlank from "./assets/StoreBlank.svg";
import StoreFilled from "./assets/StoreFilled.svg";

const NAV_ITEMS = [
  {
    href: "/shop/lives",
    label: "라이브",
    icon: LiveBlank,
    activeIcon: LiveFilled,
  },
  {
    href: "/shop/products",
    label: "상품",
    icon: ProductBlank,
    activeIcon: ProductFilled,
  },
  {
    href: "/shop/orders",
    label: "주문",
    icon: OrderBlank,
    activeIcon: OrderFilled,
  },
  { href: "/shop", label: "스토어", icon: StoreBlank, activeIcon: StoreFilled },
];

//판매자용 네비게이션
export function SellerNav() {
  const pathname = usePathname();

  // "/shop"은 다른 탭 경로의 접두사이므로 하위 경로까지 활성 처리하지 않는다.
  const activeHref = NAV_ITEMS.filter(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="bg-gray-00 flex h-[6.6rem] w-full items-center border-t border-gray-300 px-20">
      {NAV_ITEMS.map(({ href, label, icon, activeIcon }) => (
        <NavItem
          key={href}
          href={href}
          label={label}
          icon={icon}
          activeIcon={activeIcon}
          active={href === activeHref}
        />
      ))}
    </nav>
  );
}
