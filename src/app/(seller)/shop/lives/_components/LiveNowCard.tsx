"use client";

import EditIcon from "@/assets/Edit.svg";
import LinkIcon from "@/assets/Link.svg";
import type { SellerBroadcastingLive } from "@/types/live";

import { CardButton, IconCardButton } from "./CardButton";

export function LiveNowCard({
  live,
  onWatch,
  onCopyLink,
  onEdit,
}: {
  live: SellerBroadcastingLive;
  onWatch: () => void;
  onCopyLink: () => void;
  onEdit: () => void;
}) {
  return (
    <section className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-12 p-16">
      <div className="flex w-full flex-col gap-6 p-2">
        <div className="flex items-center gap-4">
          <span className="text-l5-semibold text-fg-brand">지금 방송중</span>
          <span className="text-l5-medium text-fg-neutral-secondary">∙</span>
          <span className="text-l5-medium text-fg-neutral-secondary">
            판매율 {live.sellThroughRate}%
          </span>
        </div>
        <h2 className="text-t2-bold text-fg-neutral-solid">{live.title}</h2>
      </div>

      <div className="flex w-full items-center gap-8">
        <CardButton label="방송 보기" onClick={onWatch} />
        <IconCardButton
          label="링크 복사"
          icon={LinkIcon}
          onClick={onCopyLink}
        />
        <IconCardButton label="라이브 수정" icon={EditIcon} onClick={onEdit} />
      </div>
    </section>
  );
}
