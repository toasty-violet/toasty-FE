import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toasty",
  description: "Toasty",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col items-center justify-center bg-zinc-100 dark:bg-black">
        <div className="mx-auto flex h-[84.4rem] w-full max-w-[39rem] flex-col overflow-y-auto rounded-[0.5rem] bg-white dark:bg-zinc-950">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </body>
    </html>
  );
}
