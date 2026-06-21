import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * 온디맨드 ISR (Incremental Static Regeneration) 재검증 API
 *
 * Notion 데이터 변경 후 이 엔드포인트를 호출하면
 * 정적 페이지를 즉시 재생성합니다.
 *
 * 사용법:
 * curl -X POST "https://your-domain.com/api/revalidate?secret=YOUR_SECRET"
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청에서 secret 파라미터 추출
    const secret = request.nextUrl.searchParams.get("secret");

    // 2. 환경 변수에서 설정된 secret과 비교
    const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

    if (!REVALIDATE_SECRET) {
      console.warn(
        "[ISR API] ⚠️ REVALIDATE_SECRET 환경 변수가 설정되지 않았습니다. " +
        "Vercel Dashboard의 Environment Variables에서 설정하세요."
      );
      return NextResponse.json(
        {
          revalidated: false,
          message: "REVALIDATE_SECRET 환경 변수가 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    if (secret !== REVALIDATE_SECRET) {
      console.warn("[ISR API] ⚠️ 잘못된 secret으로 재검증 요청됨");
      return NextResponse.json(
        { revalidated: false, message: "유효하지 않은 secret입니다." },
        { status: 401 }
      );
    }

    // 3. 재검증 수행
    console.log("[ISR API] ✅ 재검증 시작...");

    // 홈 페이지 재검증
    revalidatePath("/");
    console.log("[ISR API] ✅ / (홈 페이지) 재검증 완료");

    // 모든 동적 포스트 페이지 재검증
    revalidatePath("/posts/[slug]", "page");
    console.log("[ISR API] ✅ /posts/[slug] (포스트 상세) 재검증 완료");

    return NextResponse.json(
      {
        revalidated: true,
        timestamp: new Date().toISOString(),
        message: "페이지가 성공적으로 재검증되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ISR API] ❌ 재검증 중 오류 발생:", error);
    return NextResponse.json(
      {
        revalidated: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
