"use client";

import { useQuery } from "@tanstack/react-query";

import { formatCountOrDash } from "@/lib/format";
import { fetchSellerShop } from "@/lib/user";

export function ShippingFeeCard() {
  const {
    data: shop,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchSellerShop,
  });

  const shippingFee = shop?.shippingFee;
  const rows = [
    {
      label: "기본 배송비",
      text: formatCountOrDash(shippingFee?.baseShippingFee, "원"),
    },
    {
      label: "무료배송 기준 금액",
      text: formatCountOrDash(shippingFee?.freeShippingThreshold, "원"),
    },
    {
      label: "도서산간 배송비",
      text: formatCountOrDash(shippingFee?.remoteAreaShippingFee, "원"),
    },
  ];

  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-st1-bold text-fg-neutral-solid">배송비</h2>

      <div className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-12 p-16">
        {rows.map((row) => (
          <div key={row.label} className="flex w-full items-start gap-12">
            <span className="text-b4-regular text-fg-neutral-primary shrink-0">
              {row.label}
            </span>
            <span className="text-b4-regular text-fg-neutral-solid min-w-0 flex-1 text-right">
              {row.text}
            </span>
          </div>
        ))}
      </div>

      {isError && (
        <p role="alert" className="text-b4-regular text-fg-neutral-secondary">
          배송비를 불러오지 못했어요.
        </p>
      )}
      {isPending && (
        <p className="text-b4-regular text-fg-neutral-secondary">
          배송비를 불러오는 중이에요.
        </p>
      )}
    </section>
  );
}
