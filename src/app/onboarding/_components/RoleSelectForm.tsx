"use client";

import { useState, type FC, type SVGProps } from "react";
import { useRouter } from "next/navigation";

import type { UserRole } from "@/types/user";

import ShoppingBag from "./assets/ShoppingBag.svg";
import Store from "./assets/Store.svg";

type RoleOption = {
  role: UserRole;
  Icon: FC<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "CUSTOMER",
    Icon: ShoppingBag,
    title: "구매자",
    description: "상품을 구경하고\n구매할 수 있어요",
  },
  {
    role: "SELLER",
    Icon: Store,
    title: "셀러",
    description: "상품을 등록하고\n판매할 수 있어요",
  },
];

//유저가 어떤 역할로 toasty에 가입할지 선택하는 컴포넌트
export function RoleSelectForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  // 각 역할에 맞는 온보딩 화면으로 이동한다.
  const handleSubmit = () => {
    if (role === "SELLER") {
      router.push("/onboarding/seller");
      return;
    }
    if (role === "CUSTOMER") {
      router.push("/onboarding/customer");
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col px-20 pt-28">
        {/* 역할 선택 버튼 */}
        <div className="flex w-full gap-10">
          {ROLE_OPTIONS.map(({ role: option, Icon, title, description }) => (
            <button
              key={option}
              type="button"
              aria-pressed={role === option}
              onClick={() => setRole(option)}
              className={`rounded-12 flex flex-1 flex-col items-center justify-center gap-8 px-16 py-20 transition-colors ${
                role === option //역할을 선택하면 선택한 역할에 오버레이
                  ? "bg-bg-brand-weak ring-stroke-brand-solid ring-1 ring-inset"
                  : "bg-bg-neutral-weak hover:bg-bg-neutral-weak-pressed"
              }`}
            >
              <Icon className="size-40" />
              <span className="text-st1-bold text-fg-neutral-solid text-center">
                {title}
              </span>
              <span className="text-c1-medium text-fg-neutral-primary text-center whitespace-pre-line">
                {description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 최종 선택 버튼 */}
      <div className="px-20 pt-10 pb-20">
        {/* TODO: 공통 Button 컴포넌트 PR 머지 후 교체 */}
        <button
          type="button"
          disabled={!role}
          onClick={handleSubmit}
          className="rounded-12 text-l1-semibold bg-bg-brand-solid text-fg-neutral-inverted disabled:bg-bg-neutral-disabled disabled:text-fg-neutral-placeholder flex h-56 w-full items-center justify-center px-24 transition-colors"
        >
          선택
        </button>
      </div>
    </>
  );
}
