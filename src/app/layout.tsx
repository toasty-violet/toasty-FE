import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import { StatusBarColor } from "@/components/StatusBarColor";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard-local",
  weight: "45 920",
  display: "swap",
});

/**
 * iOS 는 글자가 16px 보다 작은 입력칸에 커서를 두면 화면을 확대한다.
 * 채팅처럼 작은 글씨 입력칸이 있어, 확대 배율을 묶어 화면이 튀지 않게 한다.
 */
export const viewport: Viewport = { maximumScale: 1 };

export const metadata: Metadata = {
  title: "Toasty",
  description: "Toasty",
  // 홈 화면에 추가해 열면 주소창 없이 뜬다. iOS 는 manifest 를 보지 않아 따로 적는다.
  appleWebApp: { capable: true, statusBarStyle: "default", title: "토스티" },
  icons: { apple: "/apple-touch-icon.png" },
  // iOS 16.3 이하는 manifest 의 display 를 보지 않아 이 메타로만 전체 화면이 된다.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col items-center justify-center">
        <StatusBarColor />
        {/*
          바깥 래퍼는 스크롤하지 않는 앱 프레임이다.
          바텀시트 같은 오버레이가 화면 전체가 아니라 이 프레임만 덮도록,
          그리고 본문이 스크롤돼도 제자리에 있도록 여기를 기준점으로 삼는다.
        */}
        {/*
          폰에서는 화면을 그대로 채운다. 390×844 는 디자인 기준일 뿐이라,
          그 크기로 고정하면 화면이 더 큰 폰에서는 좌우·아래에 흰 띠가 남고
          더 작은 폰에서는 하단 버튼이 화면 밖으로 밀린다.
          데스크톱에서만 폰 크기의 프레임으로 보여준다.
        */}
        <div
          id={APP_FRAME_ID}
          className="relative mx-auto h-dvh w-full overflow-hidden bg-white sm:h-[84.4rem] sm:max-w-[39rem] sm:rounded-[0.5rem]"
        >
          <div className="scrollbar-hidden flex size-full flex-col overflow-y-auto overscroll-contain">
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
