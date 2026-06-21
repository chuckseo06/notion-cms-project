// 전역 레이아웃 — 모든 페이지에 헤더/푸터를 적용합니다.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  title: {
    // 개별 페이지에서 title을 지정하지 않으면 기본값 사용
    default: process.env.NEXT_PUBLIC_BLOG_TITLE ?? "My Blog",
    // 포스트 페이지: "포스트 제목 | My Blog" 형식
    template: `%s | ${process.env.NEXT_PUBLIC_BLOG_TITLE ?? "My Blog"}`,
  },
  description: process.env.NEXT_PUBLIC_BLOG_DESCRIPTION ?? "Notion으로 운영하는 개인 블로그",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "/",
    siteName: process.env.NEXT_PUBLIC_BLOG_TITLE ?? "My Blog",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
