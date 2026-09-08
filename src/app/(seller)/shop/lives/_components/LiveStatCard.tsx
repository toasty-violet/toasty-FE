import { Fragment } from "react";

import type { SellerLiveStat } from "@/types/live";

import { formatStat } from "./live-tab-format";

export function LiveStatCard({ stat }: { stat: SellerLiveStat | null }) {
  const items = [
    { label: "시청자 수", value: formatStat(stat?.viewerCount, "명") },
    { label: "주문 수", value: formatStat(stat?.orderCount, "건") },
    { label: "판매 금액", value: formatStat(stat?.salesAmount, "원") },
  ];

  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-st1-bold text-fg-neutral-solid">최신 라이브 현황</h2>

      <div className="bg-bg-layer-default rounded-12 flex w-full items-stretch justify-center gap-12 px-12 py-20">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <div className="bg-stroke-neutral-weak w-px shrink-0" />
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 text-center">
              <span className="text-l2-bold text-fg-neutral-solid w-full truncate">
                {item.value}
              </span>
              <span className="text-l5-medium text-fg-neutral-secondary w-full">
                {item.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
