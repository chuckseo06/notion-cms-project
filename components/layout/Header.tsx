// 블로그 전역 헤더 컴포넌트
// 블로그 타이틀과 홈 링크를 포함합니다.

import Link from "next/link";

export function Header() {
  const blogTitle = process.env.NEXT_PUBLIC_BLOG_TITLE ?? "My Blog";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-4xl items-center px-4">
        <Link
          href="/"
          className="font-semibold text-foreground transition-opacity hover:opacity-80"
        >
          {blogTitle}
        </Link>
      </div>
    </header>
  );
}
