import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "404 - 페이지를 찾을 수 없습니다",
  description: "요청하신 페이지를 찾을 수 없습니다.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="w-full min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4 py-16 md:py-24 bg-background min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          {/* 404 에러 코드 */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-amber-200 mb-4">
              404
            </h1>
            <div className="h-1 w-24 bg-gray-500 mx-auto mb-8"></div>
          </div>

          {/* 에러 메시지 */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            아래의 버튼을 통해 홈으로 돌아가세요.
          </p>

          {/* 홈으로 이동 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="mr-2">←</span>
              홈으로 돌아가기
            </Link>
            <a
              href="javascript:history.back()"
              className="inline-flex items-center justify-center px-8 py-3 bg-amber-200 text-foreground font-semibold rounded-lg hover:bg-amber-300 transition-colors"
            >
              <span className="mr-2">↶</span>
              이전 페이지
            </a>
          </div>

          {/* 추가 정보 */}
          <div className="mt-12 p-6 bg-background rounded-lg border border-amber-200">
            <p className="text-sm text-gray-600">
              계속 문제가 발생하면{" "}
              <Link href="/" className="text-gray-600 hover:underline font-semibold">
                홈페이지
              </Link>
              를 방문해주세요.
            </p>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
