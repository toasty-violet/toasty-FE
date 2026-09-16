"use client";

import { useEffect, useRef } from "react";
import type { MediaPlayer } from "amazon-ivs-player";

const WASM_WORKER_URL = "/ivs/amazon-ivs-wasmworker.min.js";
const WASM_BINARY_URL = "/ivs/amazon-ivs-wasmworker.min.wasm";

export function LivePlayer({
  playbackUrl,
  muted,
  onPlaybackError,
}: {
  playbackUrl: string;
  /** 소리가 있는 자동재생은 브라우저가 막아, 켜는 것은 화면이 사용자에게 받는다. */
  muted: boolean;
  /** 재생 실패는 화면이 대신 알린다. 다시 재생되면 null 이 온다. */
  onPlaybackError: (message: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<MediaPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let player: MediaPlayer | undefined;

    async function setup() {
      const { create, isPlayerSupported, PlayerEventType, PlayerState } =
        await import("amazon-ivs-player");

      if (!isPlayerSupported) {
        onPlaybackError("이 브라우저는 재생을 지원하지 않습니다.");
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

      player.addEventListener(PlayerEventType.ERROR, (error) =>
        onPlaybackError(`재생할 수 없습니다. ${error.message}`),
      );
      player.addEventListener(PlayerState.PLAYING, () => onPlaybackError(null));

      playerRef.current = player;
      // 소리가 있는 자동재생은 브라우저가 막으므로 음소거로 시작한다.
      player.setMuted(true);
      player.setAutoplay(true);
      player.load(playbackUrl);
    }

    setup();

    return () => {
      cancelled = true;
      playerRef.current = null;
      player?.pause();
      player?.delete();
    };
  }, [playbackUrl, onPlaybackError]);

  // 켜는 순간에는 이미 사용자가 눌렀으므로 브라우저가 막지 않는다.
  useEffect(() => {
    playerRef.current?.setMuted(muted);
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // 화면을 가득 채우는 배경이라 컨트롤을 두지 않는다. 실패 문구는 화면이 그린다.
  return (
    <video
      ref={videoRef}
      playsInline
      muted
      aria-label="라이브 영상"
      className="size-full bg-black object-cover"
    />
  );
}
