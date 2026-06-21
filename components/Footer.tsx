export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 블로거 소개 */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              개발 관련 글을 작성하고 공유하는 개인 블로그입니다.
            </p>
          </div>

          {/* 카테고리/태그 (선택적) */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">주제</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>웹 개발</li>
              <li>프로그래밍</li>
              <li>기술 블로그</li>
            </ul>
          </div>

          {/* 소셜 링크 (선택적) */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 pt-6">
          {/* 저작권 */}
          <div className="text-center text-sm text-gray-600">
            <p>&copy; {currentYear} My Blog. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">
              Powered by Next.js & Notion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
