"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 데스크톱은 앱 프레임을 가운데 두고 바깥을 어둡게 두므로 건드리지 않는다.
const PHONE = "(max-width: 39.99rem)";

// 화면이 갈릴 때 본문이 한 박자 늦게 그려지기도 해서 두 번 읽는다.
const SETTLE_MS = 300;

/** 화면 맨 위의 배경색. 투명하면 부모로 올라가며 찾는다. */
function topColor() {
  let node = document.elementFromPoint(window.innerWidth / 2, 1);

  while (node) {
    const { backgroundColor } = getComputedStyle(node);
    if (backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)") {
      return backgroundColor;
    }
    node = node.parentElement;
  }

  return "";
}

/**
 * 홈 화면에 추가해 열면 상태바 자리를 body 배경이 채운다.
 * 화면마다 맨 위 색이 달라(흰색·회색·검정·브랜드색) 고정할 수 없으므로 그때그때 맞춘다.
 */
export function StatusBarColor() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia(PHONE).matches) return;

    const sync = () => {
      document.body.style.backgroundColor = topColor();
    };

    const frame = requestAnimationFrame(sync);
    const settled = window.setTimeout(sync, SETTLE_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settled);
    };
  }, [pathname]);

  return null;
}
