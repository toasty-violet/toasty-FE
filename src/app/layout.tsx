import type { Metadata } from "next";
import localFont from "next/font/local";
import { MswProvider } from "@/providers/msw-provider";
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
        <div className="mx-auto flex h-[84.4rem] w-full max-w-[39rem] flex-col overflow-y-auto rounded-[0.5rem] bg-white">
          <MswProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </MswProvider>
        </div>
      </body>
    </html>
  );
}
