"use client";

import Link from "next/link";

import DefaultImage from "@/assets/DefaultImage.svg";
import { formatThousand } from "@/lib/format";
import type { PublicLive } from "@/types/live";

import { formatLiveStartAt } from "./live-now-format";

type LiveNowCardProps = {
  live: PublicLive;
  onToggleFollow: (live: PublicLive) => void;
};

/** 디자인상 카드 한 장의 고정 폭. 썸네일과 아래 텍스트가 이 폭을 공유한다. */
const CARD_WIDTH = "w-[22.8rem]";

/**
 * 홈 "지금 뜨는 라이브" 한 장.
 * 방송 중이면 썸네일 위에 셀러 한 줄을, 예정이면 흐린 배경 위에 셀러를 크게 세운다.
 */
export function LiveNowCard({ live, onToggleFollow }: LiveNowCardProps) {
  const isLive = live.status === "LIVE";

  return (
    <div className={`flex flex-col gap-12 ${CARD_WIDTH}`}>
      <Link
        href={`/live/${live.publicId}`}
        className="rounded-12 bg-bg-neutral-weak relative flex h-[34.2rem] w-full flex-col justify-end overflow-hidden"
      >
        {isLive ? (
          <LiveThumbnail live={live} onToggleFollow={onToggleFollow} />
        ) : (
          <ReadyThumbnail live={live} onToggleFollow={onToggleFollow} />
        )}
      </Link>

      <div className="flex w-full flex-col gap-6">
        <p className="text-st1-medium text-fg-neutral-solid w-full truncate">
          {live.title}
        </p>
        {/* 예정 라이브는 아직 시청자가 없어 줄 자체를 두지 않는다. */}
        {isLive && (
          <p className="text-l5-regular text-fg-neutral-secondary w-full truncate">
            {formatThousand(live.viewerCount)}명 시청중
          </p>
        )}
      </div>
    </div>
  );
}

/** 방송 중. 셀러가 가린 만큼 썸네일이 보이도록 아래에만 어둡게 깐다. */
function LiveThumbnail({ live, onToggleFollow }: LiveNowCardProps) {
  return (
    <>
      <CardImage src={live.thumbnailUrl} />

      <span className="bg-bg-brand-solid text-l5-semibold text-fg-neutral-inverted rounded-6 absolute top-14 left-14 flex h-24 items-center px-10">
        LIVE
      </span>

      <div className="relative flex w-full flex-col justify-end gap-6 bg-gradient-to-b from-transparent to-[#1a1c2099] to-[90%] px-14 pt-48 pb-14">
        <div className="flex w-full items-center gap-8">
          <ProfileImage src={live.seller.shopImageUrl} className="size-32" />
          <p className="text-l4-semibold text-fg-neutral-inverted min-w-0 flex-1 truncate">
            {live.seller.shopName}
          </p>
          <FollowButton live={live} onToggleFollow={onToggleFollow} inverted />
        </div>
      </div>
    </>
  );
}

/**
 * 방송 예정. 아직 썸네일이 없으므로 셀러 프로필을 크게 깔고 흐리게 덮어,
 * 그 위에 셀러를 세운다.
 */
function ReadyThumbnail({ live, onToggleFollow }: LiveNowCardProps) {
  return (
    <>
      <CardImage src={live.seller.shopImageUrl} />

      <span className="bg-bg-overlay text-l5-semibold text-fg-neutral-inverted rounded-6 absolute top-14 left-14 z-10 flex items-center px-10 py-6 backdrop-blur-[0.4rem]">
        {formatLiveStartAt(live.scheduledAt)}
      </span>

      <div className="bg-bg-overlay relative flex w-full flex-1 flex-col items-center justify-center gap-12 px-14 pt-24 pb-14 backdrop-blur-[1.5rem]">
        <ProfileImage src={live.seller.shopImageUrl} className="size-72" />
        <p className="text-l2-bold text-fg-neutral-inverted w-full truncate text-center">
          {live.seller.shopName}
        </p>
        <FollowButton live={live} onToggleFollow={onToggleFollow} />
      </div>
    </>
  );
}

/** 카드 바닥에 깔리는 사진. 없으면 기본 이미지로 채운다. */
function CardImage({ src }: { src: string }) {
  if (!src) {
    return <DefaultImage className="absolute inset-0 size-full" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 size-full object-cover"
      draggable={false}
    />
  );
}

function ProfileImage({ src, className }: { src: string; className: string }) {
  return (
    <div
      className={`border-stroke-neutral-weak bg-bg-neutral-weak shrink-0 overflow-hidden rounded-full border ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <DefaultImage className="size-full" />
      )}
    </div>
  );
}

/**
 * 카드가 통째로 시청 링크라서, 팔로우는 링크를 타지 않도록 직접 막는다.
 * 사진 위에 얹히는 탓에 공용 Button 의 색 조합으로는 대비가 나오지 않아 따로 그린다.
 */
function FollowButton({
  live,
  onToggleFollow,
  inverted = false,
}: LiveNowCardProps & { inverted?: boolean }) {
  const followed = live.following;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        onToggleFollow(live);
      }}
      className={`text-l5-semibold rounded-8 flex h-32 shrink-0 items-center justify-center px-12 transition-colors ${
        followed
          ? `border-stroke-neutral-weak text-fg-neutral-inverted border ${inverted ? "" : "bg-bg-overlay-muted"}`
          : "bg-bg-layer-default text-fg-neutral-strong"
      }`}
    >
      {followed ? "팔로잉" : "팔로우"}
    </button>
  );
}

export function LiveNowCardSkeleton() {
  return (
    <div className={`flex flex-col gap-12 ${CARD_WIDTH}`}>
      <div className="bg-bg-neutral-weak rounded-12 h-[34.2rem] w-full animate-pulse" />
      <div className="flex w-full flex-col gap-6">
        <div className="bg-bg-neutral-weak rounded-4 h-16 w-4/5 animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-4 h-11 w-2/5 animate-pulse" />
      </div>
    </div>
  );
}
