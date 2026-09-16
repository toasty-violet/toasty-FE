import type { MetadataRoute } from "next";

/** 홈 화면에 추가해 열면 주소창 없이 앱처럼 뜬다. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "토스티",
    short_name: "토스티",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    // 상단 상태바 색. 화면 바탕이 흰색이라 이어 보이게 맞춘다.
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
