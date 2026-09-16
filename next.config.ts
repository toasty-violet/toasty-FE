import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 상품·스토어 사진은 모두 이 버킷에서 온다. 등록해 두면 next/image 가
    // 화면 크기에 맞게 줄이고 캐시한다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "toasty-media.s3.ap-northeast-2.amazonaws.com",
      },
      // 로컬 서버가 심어 두는 예시 사진.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              // SVGO 기본값이 viewBox 를 지운다. 그러면 24px 로 그려진 아이콘을
              // 다른 크기로 쓸 때 축소가 아니라 크롭이 된다.
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
