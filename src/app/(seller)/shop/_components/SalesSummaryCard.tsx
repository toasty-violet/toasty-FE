"use client";

import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";

import { formatCountOrDash } from "@/lib/format";
import { fetchSellerShop } from "@/lib/user";

export function SalesSummaryCard() {
  const {
    data: shop,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchSellerShop,
  });

  const summary = shop?.salesSummary;
  const items = [
    {
      label: "총 판매",
      text: formatCountOrDash(summary?.totalSalesCount, "건"),
    },
    {
      label: "누적 구매자",
      text: formatCountOrDash(summary?.totalBuyerCount, "명"),
    },
    {
      label: "누적 판매액",
      text: formatCountOrDash(summary?.totalSalesAmount, "원"),
    },
  ];

  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-st1-bold text-fg-neutral-solid">판매 내역 요약</h2>

      <div className="bg-bg-layer-default rounded-12 flex w-full items-stretch justify-center gap-12 px-12 py-20">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <div className="bg-stroke-neutral-weak w-px shrink-0" />
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 text-center">
              <span className="text-l2-bold text-fg-neutral-solid w-full truncate">
                {item.text}
              </span>
              <span className="text-l5-medium text-fg-neutral-secondary w-full">
                {item.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>

      {isError && (
        <p role="alert" className="text-b4-regular text-fg-neutral-secondary">
          판매 내역을 불러오지 못했어요.
        </p>
      )}
      {isPending && (
        <p className="text-b4-regular text-fg-neutral-secondary">
          판매 내역을 불러오는 중이에요.
        </p>
      )}
    </section>
  );
}
