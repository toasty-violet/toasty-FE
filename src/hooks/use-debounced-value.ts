"use client";

import { useEffect, useState } from "react";

/**
 * 값이 delay 동안 멈춰 있을 때만 갱신되는 사본을 돌려준다.
 * 초깃값은 기다릴 이전 입력이 없어 그대로 나가므로,
 * 값을 채운 채 시작하는 화면은 호출부에서 조회 여부를 따로 판단한다.
 */
export function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    // 다음 입력이 들어오면 이전 타이머를 버려 마지막 값만 남긴다.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
