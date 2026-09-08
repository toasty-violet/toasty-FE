"use client";

import LinkIcon from "@/assets/Link.svg";
import MoreIcon from "@/assets/More.svg";
import PlayIcon from "@/assets/Play.svg";
import PlusIcon from "@/assets/Plus.svg";
import LiveIcon from "@/assets/Live.svg";
import type { SellerScheduledLive } from "@/types/live";

import { CardButton } from "./CardButton";
import { formatScheduledAt } from "./live-tab-format";

function UpcomingLiveCard({
  live,
  onCopyLink,
  onStart,
  onMore,
}: {
  live: SellerScheduledLive;
  onCopyLink: () => void;
  onStart: () => void;
  onMore: () => void;
}) {
  return (
    <li className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-12 p-20">
      <div className="flex w-full items-start gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <h3 className="text-st1-semibold text-fg-neutral-solid">
            {live.title}
          </h3>
          <div className="text-l5-medium text-fg-neutral-secondary flex items-center gap-4">
            <span>{formatScheduledAt(live.scheduledAt)}</span>
            <span>∙</span>
            <span>상품 {live.productCount}개</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="더보기"
          onClick={onMore}
          className="text-fg-neutral-secondary shrink-0"
        >
          <MoreIcon className="h-24 w-8 [&_path]:fill-current" />
        </button>
      </div>

      <div className="flex w-full items-center gap-8">
        <CardButton label="링크 복사" icon={LinkIcon} onClick={onCopyLink} />
        <CardButton
          label="방송 시작"
          icon={PlayIcon}
          tone="strong"
          onClick={onStart}
        />
      </div>
    </li>
  );
}

/** 목록 아래에서는 테두리만, 빈 상태에서는 채운 버튼으로 쓴다. */
function CreateLiveButton({
  onClick,
  tone = "outlined",
}: {
  onClick: () => void;
  tone?: "outlined" | "solid";
}) {
  const solid = tone === "solid";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-10 text-l4-semibold flex h-[4.4rem] items-center justify-center gap-4 whitespace-nowrap transition-colors ${
        solid
          ? "bg-bg-neutral-strong text-fg-neutral-inverted pr-20 pl-16"
          : "border-stroke-neutral-weak text-fg-neutral-primary w-full border px-20"
      }`}
    >
      {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
      <PlusIcon className="size-18 [&_path]:fill-current" />
      신규 라이브
    </button>
  );
}

export function UpcomingLiveSection({
  lives,
  onCreate,
  onCopyLink,
  onStart,
  onMore,
}: {
  lives: SellerScheduledLive[];
  onCreate: () => void;
  onCopyLink: (live: SellerScheduledLive) => void;
  onStart: (live: SellerScheduledLive) => void;
  onMore: (live: SellerScheduledLive) => void;
}) {
  if (lives.length === 0) {
    return (
      <section className="flex w-full flex-1 flex-col items-center justify-center gap-28">
        <div className="flex w-full flex-col items-center justify-center gap-8 text-center">
          <LiveIcon className="size-[6rem]" />
          <p className="text-t2-bold text-fg-neutral-primary w-full">
            예정된 라이브가 없어요
          </p>
          <p className="text-b1-reading-medium text-fg-neutral-primary w-full">
            라이브를 설정하고
            <br />
            방송을 시작해보세요!
          </p>
        </div>
        <CreateLiveButton onClick={onCreate} tone="solid" />
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-st1-bold text-fg-neutral-solid">예정된 라이브</h2>

      <ul className="flex w-full flex-col gap-12">
        {lives.map((live) => (
          <UpcomingLiveCard
            key={live.liveId}
            live={live}
            onCopyLink={() => onCopyLink(live)}
            onStart={() => onStart(live)}
            onMore={() => onMore(live)}
          />
        ))}
        <CreateLiveButton onClick={onCreate} />
      </ul>
    </section>
  );
}
