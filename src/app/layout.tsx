import type { Metadata } from "next";
import localFont from "next/font/local";
import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard-local",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Toasty",
  description: "Toasty",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col items-center justify-center">
        {/*
          바깥 래퍼는 스크롤하지 않는 앱 프레임이다.
          바텀시트 같은 오버레이가 화면 전체가 아니라 이 프레임만 덮도록,
          그리고 본문이 스크롤돼도 제자리에 있도록 여기를 기준점으로 삼는다.
        */}
        <div
          id={APP_FRAME_ID}
          className="relative mx-auto h-[84.4rem] w-full max-w-[39rem] overflow-hidden rounded-[0.5rem] bg-white"
        >
          <div className="flex size-full flex-col overflow-y-auto">
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
