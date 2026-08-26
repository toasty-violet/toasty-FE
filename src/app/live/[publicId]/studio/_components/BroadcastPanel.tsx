"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AmazonIVSBroadcastClient } from "amazon-ivs-web-broadcast";
import {
  endLive,
  getLiveStreamStatus,
  reissueBroadcastCredential,
} from "@/app/live/_lib/live-api";
import { describeLiveError } from "@/app/live/_lib/live-error";
import type { BroadcastCredential, Live } from "@/types/live";

type Status =
  "preparing" | "ready" | "starting" | "live" | "ended" | "unavailable";

const STREAM_STATUS_POLL_MS = 4000;

export function BroadcastPanel({ live }: { live: Live }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clientRef = useRef<AmazonIVSBroadcastClient | null>(null);
  const [status, setStatus] = useState<Status>("preparing");
  const [connection, setConnection] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let client: AmazonIVSBroadcastClient | undefined;
    const streams: MediaStream[] = [];

    const releaseStreams = () =>
      streams.forEach((stream) =>
        stream.getTracks().forEach((track) => track.stop()),
      );

    async function setup() {
      const IVSBroadcastClient = (await import("amazon-ivs-web-broadcast"))
        .default;
      if (cancelled) return;

      if (!IVSBroadcastClient.isSupported()) {
        setStatus("unavailable");
        setMessage("이 브라우저는 송출을 지원하지 않습니다.");
        return;
      }

      // 카메라와 마이크는 따로 요청한다. SDK가 각각을 별도 입력으로 받는다.
      // 얻는 즉시 streams 에 넣어야 중간에 정리가 지나가도 트랙을 놓치지 않는다.
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 } },
      });
      streams.push(videoStream);
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streams.push(audioStream);

      if (cancelled) {
        releaseStreams();
        return;
      }

      client = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.BASIC_PORTRAIT,
      });

      if (canvasRef.current) {
        client.attachPreview(canvasRef.current);
      }
      await client.addVideoInputDevice(videoStream, "camera", { index: 0 });
      await client.addAudioInputDevice(audioStream, "mic");

      client.emitter.on(
        IVSBroadcastClient.BroadcastClientEvents.CONNECTION_STATE_CHANGE,
        (state) => setConnection(state),
      );
      client.emitter.on(
        IVSBroadcastClient.BroadcastClientEvents.ERROR,
        (error) => setMessage(error.message),
      );

      if (cancelled) {
        client.delete();
        releaseStreams();
        return;
      }

      clientRef.current = client;
      setStatus("ready");
    }

    setup().catch((error: unknown) => {
      if (cancelled) return;
      setStatus("unavailable");
      setMessage(
        error instanceof Error
          ? `카메라·마이크를 켜지 못했습니다. ${error.message}`
          : "카메라·마이크를 켜지 못했습니다.",
      );
    });

    return () => {
      cancelled = true;
      clientRef.current = null;
      client?.detachPreview();
      client?.delete();
      releaseStreams();
    };
  }, []);

  const { data: streamStatus } = useQuery({
    queryKey: ["live-stream-status", live.liveId],
    queryFn: () => getLiveStreamStatus(live.liveId),
    enabled: status === "live",
    refetchInterval: STREAM_STATUS_POLL_MS,
  });

  const endMutation = useMutation({
    mutationFn: () => endLive(live.liveId),
    onSuccess: () => {
      clientRef.current?.stopBroadcast();
      setStatus("ended");
    },
  });

  useEffect(() => {
    if (status !== "live") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  async function startBroadcast() {
    const client = clientRef.current;
    if (!client) return;

    setStatus("starting");
    setMessage(null);

    let fresh: BroadcastCredential;
    try {
      fresh = await reissueBroadcastCredential(live.liveId);
    } catch (error: unknown) {
      setStatus("ready");
      setMessage(describeLiveError(error).message);
      return;
    }

    // 실패를 reject 대신 resolve 로 돌려주는 경우가 있어 반환값도 확인한다.
    const failure = await client
      .startBroadcast(fresh.streamKey, fresh.ingestEndpoint)
      .catch((error: unknown) => error);

    if (failure instanceof Error) {
      setStatus("ready");
      setMessage(`송출을 시작하지 못했습니다. ${failure.message}`);
      return;
    }
    setStatus("live");
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

      <canvas
        ref={canvasRef}
        className="aspect-[9/16] w-full rounded-xl bg-zinc-900"
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">
          {status === "preparing" && "카메라를 준비하는 중…"}
          {status === "ready" && "준비됨"}
          {status === "starting" && "연결하는 중…"}
          {status === "live" &&
            (streamStatus?.broadcasting ? "방송 중" : "서버 확인 대기")}
          {status === "ended" && "방송이 종료되었습니다"}
          {status === "unavailable" && "송출할 수 없음"}
        </span>
        {connection && (
          <span className="text-xs text-zinc-400">{connection}</span>
        )}
      </div>

      {(message || endMutation.error) && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {message ?? describeLiveError(endMutation.error).message}
        </p>
      )}

      {status === "live" ? (
        <button
          type="button"
          onClick={() => endMutation.mutate()}
          disabled={endMutation.isPending}
          className="rounded-lg bg-red-600 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {endMutation.isPending ? "종료하는 중…" : "방송 종료"}
        </button>
      ) : (
        <button
          type="button"
          onClick={startBroadcast}
          disabled={status !== "ready"}
          className="rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
        >
          송출 시작
        </button>
      )}
    </div>
  );
}
