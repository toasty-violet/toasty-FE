"use client";

import { useEffect, useRef, useState } from "react";
import type { AmazonIVSBroadcastClient } from "amazon-ivs-web-broadcast";
import type { BroadcastCredential, Live } from "@/types/live";

type Status = "preparing" | "ready" | "starting" | "live" | "unavailable";

export function BroadcastPanel({
  live,
  credential,
}: {
  live: Live;
  credential: BroadcastCredential;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clientRef = useRef<AmazonIVSBroadcastClient | null>(null);
  const [status, setStatus] = useState<Status>("preparing");
  const [connection, setConnection] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  // SDK는 self·WebRTC에 의존하는 브라우저 전용이라 서버에서 import 되면 안 된다.
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

      // 정리가 이미 지나갔다면 여기서 직접 끈다.
      if (cancelled) {
        releaseStreams();
        return;
      }

      client = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.BASIC_PORTRAIT,
        ingestEndpoint: credential.ingestEndpoint,
      });

      if (canvasRef.current) {
        client.attachPreview(canvasRef.current);
      }
      await client.addVideoInputDevice(videoStream, "camera", { index: 0 });
      await client.addAudioInputDevice(audioStream, "mic");
      if (cancelled) return;

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
  }, [credential.ingestEndpoint]);

  // 새로고침하면 streamKey가 사라져 라이브를 다시 만들어야 한다.
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
    // 실패를 reject 대신 resolve 로 돌려주는 경우가 있어 반환값도 확인한다.
    const failure = await client
      .startBroadcast(credential.streamKey)
      .catch((error: unknown) => error);

    if (failure instanceof Error) {
      setStatus("ready");
      setMessage(`송출을 시작하지 못했습니다. ${failure.message}`);
      return;
    }
    setStatus("live");
  }

  function stopBroadcast() {
    clientRef.current?.stopBroadcast();
    setStatus("ready");
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
          {status === "live" && "송출 중"}
          {status === "unavailable" && "송출할 수 없음"}
        </span>
        {connection && (
          <span className="text-xs text-zinc-400">{connection}</span>
        )}
      </div>

      {message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {message}
        </p>
      )}

      {status === "live" ? (
        <button
          type="button"
          onClick={stopBroadcast}
          className="rounded-lg bg-red-600 py-3 text-sm font-medium text-white"
        >
          송출 중지
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

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        새로고침하면 송출 정보가 사라져 라이브를 다시 만들어야 합니다.
      </p>
    </div>
  );
}
