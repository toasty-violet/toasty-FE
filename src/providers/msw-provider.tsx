"use client";

import { useEffect, useState } from "react";

export function MswProvider({ children }: { children: React.ReactNode }) {
  const enabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
  const [ready, setReady] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;

    // 목이 뜨기 전에 요청이 나가면 실제 서버로 새기 때문에 시작을 기다린다.
    import("@/mocks/browser")
      .then(({ startWorker }) => startWorker())
      .then(() => setReady(true));
  }, [enabled]);

  if (!ready) return null;

  return <>{children}</>;
}
