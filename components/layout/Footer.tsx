// 블로그 전역 푸터 컴포넌트
// 저작권 및 블로거 소개 1줄을 표시합니다.

export function Footer() {
  const currentYear = new Date().getFullYear();
  const blogTitle = process.env.NEXT_PUBLIC_BLOG_TITLE ?? "My Blog";

  return (
    <footer className="mt-auto w-full border-t border-border bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {currentYear} {blogTitle}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
