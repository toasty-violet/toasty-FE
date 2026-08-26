"use client";

import { useQuery } from "@tanstack/react-query";
import { LivePlayer } from "./LivePlayer";
import { ApiRequestError } from "@/lib/api-error";
import { getLive } from "@/lib/live-api";
import { LIVE_ERROR_CODE } from "@/types/live";

export function LiveViewer({ liveId }: { liveId: number }) {
  const {
    data: live,
    isPending,
    error,
  } = useQuery({
    queryKey: ["live", liveId],
    queryFn: () => getLive(liveId),
  });

  if (isPending) {
    return <p className="p-5 text-sm text-zinc-500">불러오는 중…</p>;
  }

  if (error) {
    const notFound =
      error instanceof ApiRequestError &&
      error.code === LIVE_ERROR_CODE.NOT_FOUND;
    return (
      <p role="alert" className="p-5 text-sm text-red-600 dark:text-red-400">
        {notFound
          ? "라이브를 찾을 수 없습니다."
          : "라이브를 불러오지 못했습니다."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <h1 className="text-lg font-semibold">{live.title}</h1>
        {live.description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {live.description}
          </p>
        )}
      </div>
      <LivePlayer playbackUrl={live.playbackUrl} />
    </div>
  );
}
