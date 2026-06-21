import Link from "next/link";

export function Header() {
  const currentYear = new Date().getFullYear();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* 블로그 타이틀/로고 */}
          <Link
            href="/"
            className="text-2xl md:text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            My Blog
          </Link>

          {/* 네비게이션 (향후 확장) */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              홈
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
