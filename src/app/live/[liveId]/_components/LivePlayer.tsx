"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaPlayer } from "amazon-ivs-player";

/** wasm 워커·바이너리는 predev·prebuild 에서 public/ivs 로 복사된다. */
const WASM_WORKER_URL = "/ivs/amazon-ivs-wasmworker.min.js";
const WASM_BINARY_URL = "/ivs/amazon-ivs-wasmworker.min.wasm";

export function LivePlayer({ playbackUrl }: { playbackUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let player: MediaPlayer | undefined;

    async function setup() {
      const { create, isPlayerSupported, ErrorType, PlayerEventType } =
        await import("amazon-ivs-player");

      if (!isPlayerSupported) {
        setMessage("이 브라우저는 재생을 지원하지 않습니다.");
        return;
      }

      player = create({
        wasmWorker: WASM_WORKER_URL,
        wasmBinary: WASM_BINARY_URL,
      });
      if (cancelled) {
        player.delete();
        return;
      }

      if (videoRef.current) {
        player.attachHTMLVideoElement(videoRef.current);
      }

      player.addEventListener(PlayerEventType.ERROR, (error) => {
        // 라이브 상태는 아직 READY 로 고정이라, 방송 전에는 재생 URL이 404 를 준다.
        setMessage(
          error.type === ErrorType.NOT_AVAILABLE
            ? "아직 방송이 시작되지 않았습니다."
            : `재생할 수 없습니다. ${error.message}`,
        );
      });
      player.addEventListener(PlayerEventType.INITIALIZED, () =>
        setMessage(null),
      );

      // 소리가 있는 자동재생은 브라우저가 막으므로 음소거로 시작한다.
      player.setMuted(true);
      player.setAutoplay(true);
      player.load(playbackUrl);
    }

    setup();

    return () => {
      cancelled = true;
      player?.pause();
      player?.delete();
    };
  }, [playbackUrl]);

  return (
    <div className="flex flex-col gap-2">
      <video
        ref={videoRef}
        playsInline
        controls
        className="aspect-[9/16] w-full rounded-xl bg-zinc-900"
      />
      {message && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      )}
    </div>
  );
}
