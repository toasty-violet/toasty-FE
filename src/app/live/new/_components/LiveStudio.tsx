"use client";

import { useState } from "react";
import Link from "next/link";
import { BroadcastPanel } from "./BroadcastPanel";
import { LiveCreateForm } from "./LiveCreateForm";
import type { LiveCreateResponse } from "@/types/live";

/**
 * streamKey는 생성 응답에서만 받을 수 있고 서버가 저장하지 않는다.
 * 그래서 생성과 송출을 페이지 이동 없이 이 컴포넌트의 상태로 이어붙인다.
 */
export function LiveStudio() {
  const [created, setCreated] = useState<LiveCreateResponse | null>(null);

  if (!created) {
    return <LiveCreateForm onCreated={setCreated} />;
  }

  return (
    <div className="flex flex-col">
      <BroadcastPanel
        live={created.live}
        credential={created.broadcastCredential}
      />
      <Link
        href={`/live/${created.live.publicId}`}
        className="px-5 pb-5 text-sm underline underline-offset-4"
      >
        시청 화면 열기
      </Link>
    </div>
  );
}
