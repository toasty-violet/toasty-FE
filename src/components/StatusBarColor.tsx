"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 홈 화면에 추가해 열면 상태바 자리를 body 배경이 채운다.
 * 그 자리가 화면과 이어 보이도록, 바탕이 흰색이 아닌 화면에서만 색을 바꾼다.
 */
function statusBarOf(pathname: string) {
  // 시청 화면과 송출 스튜디오는 영상이 깔려 바탕이 검다.
  if (pathname.startsWith("/live/") || pathname.endsWith("/studio")) {
    return "dark";
  }
  if (pathname === "/login") {
    return "brand";
  }
  return null;
}

export function StatusBarColor() {
  const pathname = usePathname();

  useEffect(() => {
    const statusBar = statusBarOf(pathname);

    if (statusBar) {
      document.body.dataset.statusBar = statusBar;
    } else {
      delete document.body.dataset.statusBar;
    }
  }, [pathname]);

  return null;
}
