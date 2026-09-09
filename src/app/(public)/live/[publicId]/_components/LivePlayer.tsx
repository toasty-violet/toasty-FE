"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaPlayer } from "amazon-ivs-player";

const WASM_WORKER_URL = "/ivs/amazon-ivs-wasmworker.min.js";
const WASM_BINARY_URL = "/ivs/amazon-ivs-wasmworker.min.wasm";

export function LivePlayer({
  playbackUrl,
  onError,
}: {
  playbackUrl: string;
  /** 재생 실패를 화면이 대신 알린다. */
  onError?: (message: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let player: MediaPlayer | undefined;

    async function setup() {
      const { create, isPlayerSupported, PlayerEventType, PlayerState } =
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
        const text = `재생할 수 없습니다. ${error.message}`;
        setMessage(text);
        onError?.(text);
      });
      player.addEventListener(PlayerState.PLAYING, () => {
        setMessage(null);
        onError?.("");
      });

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
    // onError 는 화면이 매 렌더 새로 만들어 넘겨도 재생을 다시 시작할 이유가 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackUrl]);

  // 화면을 가득 채우는 배경이라 컨트롤을 두지 않는다. 실패 문구는 화면이 그린다.
  return (
    <video
      ref={videoRef}
      playsInline
      muted
      aria-label={message ?? "라이브 영상"}
      className="size-full bg-black object-cover"
    />
  );
}
