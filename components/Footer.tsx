export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16" style={{ backgroundColor: '#F5E6D3' }}>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 블로거 소개 */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-foreground">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              일상의 작은 순간들을 담아두는 개인 기록 공간입니다.
            </p>
          </div>

          {/* 소셜 링크 */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-foreground">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-amber-200 pt-6">
          {/* 저작권 */}
          <div className="text-center text-sm text-gray-600">
            <p>&copy; {currentYear} 보석함. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">
              Powered by Next.js & Notion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
