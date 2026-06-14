// 커스텀 404 페이지
// notFound() 호출 또는 존재하지 않는 URL 접근 시 렌더링됩니다.

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
      {/* 404 숫자 */}
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>

      {/* 안내 메시지 */}
      <h1 className="mt-4 text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted-foreground">
        요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
      </p>

      {/* 홈으로 이동 */}
      <Button asChild className="mt-8">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
