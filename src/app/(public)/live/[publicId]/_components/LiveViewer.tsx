"use client";

import { useQuery } from "@tanstack/react-query";
import { LivePlayer } from "./LivePlayer";
import { ApiRequestError } from "@/lib/api-error";
import { getLive, getLivePlayback } from "@/app/live/_lib/live-api";
import { LIVE_ERROR_CODE } from "@/types/live";

const PLAYBACK_POLL_MS = 4000;

export function LiveViewer({ publicId }: { publicId: string }) {
  const {
    data: live,
    isPending,
    error,
  } = useQuery({
    queryKey: ["live", publicId],
    queryFn: () => getLive(publicId),
  });

  const { data: playback } = useQuery({
    queryKey: ["live-playback", publicId],
    queryFn: () => getLivePlayback(publicId),
    refetchInterval: (query) =>
      query.state.data?.status === "ENDED" ? false : PLAYBACK_POLL_MS,
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

      {playback?.status === "LIVE" ? (
        <LivePlayer playbackUrl={playback.playbackUrl} />
      ) : (
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-xl bg-zinc-900 text-sm text-zinc-400">
          {playback?.status === "ENDED"
            ? "방송이 종료되었습니다"
            : "아직 방송이 시작되지 않았습니다"}
        </div>
      )}
    </div>
  );
}
