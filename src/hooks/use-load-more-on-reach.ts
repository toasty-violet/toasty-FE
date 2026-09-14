"use client";

import { useEffect, useRef } from "react";

/**
 * 목록 끝에 닿으면 다음 묶음을 부른다. 돌려받은 ref 를 목록 끝에 둔다.
 * 받는 중에는 enabled 를 꺼야 같은 묶음을 다시 부르지 않는다.
 */
export function useLoadMoreOnReach(
  load: () => void,
  { enabled }: { enabled: boolean },
) {
  const sentinel = useRef<HTMLDivElement>(null);
  // 관찰자를 다시 만들지 않고도 최신 함수를 부르게 한다.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !enabled) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadRef.current();
    });
    observer.observe(target);

    return () => observer.disconnect();
  }, [enabled]);

  return sentinel;
}
