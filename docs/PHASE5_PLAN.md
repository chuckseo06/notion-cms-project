# Phase 5: ISR, 최적화 & 배포 (5.1~5.3) 상세 계획

**기간**: 3-4일  
**진행률**: 80% → 100% (Phase 5 완료 후)  
**버전**: 1.0

---

## 📋 전체 구조

```
Phase 5: ISR, 최적화 & 배포
├─ Phase 5.1: ISR 최적화 (1일)
│  ├─ revalidate 값 확인
│  ├─ 온디맨드 ISR API 구현 (선택적)
│  └─ ISR 동작 테스트
├─ Phase 5.2: 성능 최적화 (1-2일)
│  ├─ 이미지 최적화 (Next.js Image)
│  ├─ Notion API Rate Limiting 강화
│  └─ 번들 크기 & 빌드 시간 검증
└─ Phase 5.3: 에러 처리 & 견고성 (1일)
   ├─ API 에러 핸들링
   ├─ Zod 스키마 검증
   └─ 로깅 추가 & 테스트
```

---

## Phase 5.1: ISR (Incremental Static Regeneration) 최적화

### 목표
- ISR 설정 확인 및 검증
- 온디맨드 재검증 기능 구현 (선택적)
- 로컬/배포 환경에서 ISR 동작 확인

### Task 1: revalidate 값 확인
**파일**: `app/page.tsx`, `app/posts/[slug]/page.tsx`  
**작업**: 현재 ISR revalidate 값 확인 (3600초 = 1시간)

✅ 확인 사항:
- app/page.tsx에서 `export const revalidate = 3600;` 존재
- app/posts/[slug]/page.tsx에서 `export const revalidate = 3600;` 존재
- 둘 다 1시간 주기로 재검증되는지 확인

**검증**: 파일 읽기 후 export const revalidate 라인 확인

---

### Task 2: 온디맨드 ISR API 구현 (선택적)
**파일**: `app/api/revalidate/route.ts` (새로 생성)  
**작업**: POST 엔드포인트 구현으로 수동 재검증 가능하게 함

```typescript
// Pseudocode
export async function POST(request: NextRequest) {
  // 1. 요청에서 secret 파라미터 추출
  // 2. process.env.REVALIDATE_SECRET와 비교 검증
  // 3. 일치하면:
  //    - revalidatePath("/") 호출
  //    - revalidateTag("posts") 호출
  //    - { revalidated: true } 반환
  // 4. 불일치하면 401 에러 반환
  // 5. 예외 발생 시 500 에러 반환
}
```

**사용법**:
```bash
curl -X POST "https://your-domain.com/api/revalidate?secret=YOUR_SECRET"
# Notion 데이터 변경 후 이 요청을 호출하면 즉시 재검증
```

**검증**:
- Vercel에서 REVALIDATE_SECRET 환경 변수 설정 확인
- 올바른 secret으로 재검증 API 호출 후 상태 코드 확인

---

### Task 3: ISR 동작 테스트
**작업**: 로컬 & Vercel 배포 환경에서 ISR 검증

**로컬 테스트**:
```bash
npm run build          # 정적 빌드 생성 (.next 폴더)
npm run start          # 프로덕션 모드 시작
# localhost:3000 접속 후:
# 1. 홈 페이지 확인 (포스트 렌더링)
# 2. Notion DB에서 테스트 포스트 업데이트 (제목, 날짜 변경)
# 3. revalidate 시간(3600초)까지 기다리거나 온디맨드 API 호출
# 4. 페이지 새로고침 시 변경사항 반영 확인
```

**배포 테스트** (Vercel):
- Vercel 배포 완료 후 (Phase 5.4에서)
- Notion에서 포스트 변경
- 1시간 후 (또는 API 호출 후) 배포된 URL에서 변경사항 확인

**검증 기준**:
- ✅ Notion 데이터 변경 후 ISR 시간 내 자동 반영
- ✅ 온디맨드 API 호출 시 즉시 반영 (API 구현 시)
- ✅ 정적 페이지가 제때 재생성됨

---

## Phase 5.2: 성능 최적화

### 목표
- 이미지 로딩 성능 개선 (Next.js Image)
- Notion API Rate Limit 대응 강화
- 번들 크기 & 빌드 시간 최적화

### Task 1: 이미지 최적화 (Next.js Image 적용)
**파일**: `components/blog/PostCard.tsx`, `app/posts/[slug]/page.tsx`

**PostCard.tsx에서**:
```typescript
// Before
{post.coverImage && (
  <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
)}

// After
import Image from "next/image";
{post.coverImage && (
  <Image
    src={post.coverImage}
    alt={post.title}
    width={400}
    height={200}
    className="w-full h-48 object-cover"
    priority={false}  // 홈 페이지 여러 이미지이므로 false
  />
)}
```

**app/posts/[slug]/page.tsx에서**:
```typescript
// 커버 이미지 (히어로 섹션)
{post.coverImage && (
  <Image
    src={post.coverImage}
    alt={post.title}
    width={1200}
    height={630}
    className="w-full h-96 object-cover"
    priority={true}  // 상세 페이지의 주요 이미지이므로 true
  />
)}
```

**검증**:
- ✅ 이미지 태그가 Image 컴포넌트로 변경됨
- ✅ width/height 속성 설정 (비율 유지)
- ✅ alt 속성 포함
- ✅ 브라우저 DevTools에서 이미지 압축/최적화 확인

---

### Task 2: Notion API Rate Limiting 강화
**파일**: `lib/notion.ts`

**구현 내용**:
```typescript
// 1. 재시도 헬퍼 함수 추가
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;  // 1초

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // 429 (Rate Limit) 에러이고 재시도 남아있으면 재시도
    if (error.status === 429 && retries > 0) {
      // Exponential backoff: 1초, 2초, 4초
      const delay = INITIAL_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`[Notion API] Rate limit 초과. ${delay}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

// 2. 기존 함수들에 재시도 로직 적용
export async function getAllPosts(): Promise<NotionPost[]> {
  return withRetry(() =>
    notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "PublishedAt", direction: "descending" }],
      page_size: 100,
    })
  );
}

// 다른 API 호출 함수들도 withRetry로 감싸기
export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  return withRetry(() => {
    // 기존 로직
  });
}
```

**검증**:
- ✅ withRetry 함수가 올바르게 동작
- ✅ 429 에러 시 exponential backoff로 재시도
- ✅ 콘솔에 재시도 로그 출력
- ✅ 최대 3회 재시도 후 최종 실패

---

### Task 3: 번들 크기 & 빌드 시간 검증
**작업**: 로컬에서 빌드 후 성능 지표 확인

```bash
# 1. 전체 빌드 (프로덕션 모드)
npm run build

# 2. 빌드 결과 확인
# 확인할 항목:
# - 빌드 시간 (< 2분 목표)
# - 페이지별 번들 크기 (.next/static/chunks/)
# - 최적화 전후 비교

# 3. 구체적인 확인
ls -lh .next/static/chunks/
# 각 청크 파일 크기 < 200KB 목표
```

**빌드 결과 기록**:
- ✅ 총 빌드 시간: ___분 (< 2분)
- ✅ app/page.tsx 번들: ___KB (< 300KB)
- ✅ app/posts/[slug]/page.tsx 번들: ___KB (< 300KB)
- ✅ 공유 청크: ___KB (< 500KB)

---

## Phase 5.3: 에러 처리 & 견고성 강화

### 목표
- API 에러 핸들링 강화
- 응답 데이터 검증 (Zod)
- 로깅 추가 & 에러 시나리오 테스트

### Task 1: API 에러 핸들링 강화
**파일**: `lib/notion.ts`

**구현 내용**:
```typescript
// 1. 클라이언트 초기화 시 API Key 검증
if (!process.env.NOTION_API_KEY) {
  throw new Error(
    "[설정 오류] NOTION_API_KEY 환경 변수가 설정되지 않았습니다. " +
    ".env.local에 NOTION_API_KEY를 추가하세요."
  );
}

if (!DATABASE_ID) {
  throw new Error(
    "[설정 오류] NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. " +
    ".env.local에 NOTION_DATABASE_ID를 추가하세요."
  );
}

// 2. API 호출 시 에러별 처리
export async function getAllPosts(): Promise<NotionPost[]> {
  try {
    return withRetry(() => notion.databases.query({...}));
  } catch (error: any) {
    if (error.status === 403) {
      console.error(
        "[Notion API] 403 Forbidden: Integration이 Database에 공유되지 않았습니다. " +
        "Notion에서 Share > Integration을 확인하세요."
      );
      throw new Error("Notion 접근 권한 확인 필요");
    } else if (error.status === 404) {
      console.error(
        "[Notion API] 404 Not Found: Database ID가 잘못되었습니다. " +
        `.env.local의 NOTION_DATABASE_ID를 확인하세요. (현재: ${DATABASE_ID})`
      );
      throw new Error("Notion Database 설정 확인 필요");
    } else if (error.status === 429) {
      // withRetry에서 이미 처리되지만, 최종 실패 시
      console.error(
        "[Notion API] 429 Rate Limited: API 호출 제한 초과. " +
        "수 분 후 다시 시도하세요."
      );
      throw new Error("Notion API Rate limit 초과. 잠시 후 재시도하세요.");
    } else if (error.status === 401) {
      console.error(
        "[Notion API] 401 Unauthorized: API Key가 유효하지 않습니다. " +
        ".env.local의 NOTION_API_KEY를 확인하세요."
      );
      throw new Error("Notion API Key 검증 실패");
    } else {
      console.error(`[Notion API] 예상 외 에러 (${error.status}):`, error.message);
      throw error;
    }
  }
}
```

**검증**:
- ✅ API Key/DB ID 누락 시 명확한 에러 메시지
- ✅ 403, 404, 401, 429 등 각 에러별 처리
- ✅ 콘솔 로그에 설정 확인 안내 포함

---

### Task 2: Zod 스키마 검증 (선택적)
**파일**: `lib/notion.ts` 또는 `types/notion.ts`

**구현 내용**:
```typescript
import { z } from "zod";

// NotionPost 응답 검증 스키마
export const NotionPostSchema = z.object({
  id: z.string().uuid("유효한 UUID가 아닙니다"),
  slug: z.string().min(1, "slug는 필수입니다"),
  title: z.string().min(1, "제목은 필수입니다"),
  publishedAt: z.coerce.date().or(z.null()).default(new Date()),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().default(""),
  coverImage: z.string().url("유효한 URL이 아닙니다").nullable().default(null),
  isPublished: z.boolean().default(false),
});

export type NotionPost = z.infer<typeof NotionPostSchema>;

// 파싱 함수에서 검증
export function parsePost(data: any): NotionPost {
  const result = NotionPostSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.flatten();
    console.warn(`[Notion API] 포스트 파싱 실패:`, errors);
    throw new Error(`포스트 데이터 검증 실패: ${JSON.stringify(errors)}`);
  }
  
  return result.data;
}
```

**검증**:
- ✅ Zod 스키마 적용 후 포스트 파싱
- ✅ 유효하지 않은 데이터는 명확한 에러 메시지와 함께 거절
- ✅ 타입 안전성 강화

---

### Task 3: 로깅 추가
**파일**: `lib/notion.ts`

**구현 내용**:
```typescript
// 1. 포스트 조회 로깅
export async function getAllPosts(): Promise<NotionPost[]> {
  console.log("[Notion API] 포스트 목록 조회 시작...");
  const posts = await withRetry(() => notion.databases.query({...}));
  console.log(`[Notion API] ✅ 포스트 ${posts.length}개 조회 완료`);
  return posts;
}

// 2. 포스트 상세 조회 로깅
export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  console.log(`[Notion API] slug '${slug}' 포스트 조회 중...`);
  const post = await findPostBySlug(slug);
  if (post) {
    console.log(`[Notion API] ✅ 포스트 찾음: "${post.title}"`);
  } else {
    console.warn(`[Notion API] ⚠️ slug '${slug}' 포스트를 찾을 수 없습니다`);
  }
  return post;
}

// 3. 파싱 실패 로깅
function parsePost(data: any): NotionPost {
  try {
    return NotionPostSchema.parse(data);
  } catch (error) {
    console.warn(
      `[Notion API] 포스트 ID ${data.id} 파싱 실패:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

// 4. 캐싱 로깅 (revalidate 설정)
console.log("[Notion API] ISR revalidate: 3600초 (1시간)");
```

**로그 출력 예시**:
```
[Notion API] 포스트 목록 조회 시작...
[Notion API] ✅ 포스트 2개 조회 완료
[Notion API] slug 'test-post-1' 포스트 조회 중...
[Notion API] ✅ 포스트 찾음: "테스트 포스트 1"
```

**검증**:
- ✅ Vercel 배포 후 Logs 탭에서 로그 확인 가능
- ✅ 디버깅 시 어느 단계에서 실패하는지 쉽게 파악

---

### Task 4: 에러 시나리오 테스트
**작업**: 다양한 에러 상황 재현 및 처리 확인

**테스트 케이스**:

1. **API Key 누락**
   - `.env.local`에서 `NOTION_API_KEY` 제거
   - `npm run dev` 시작
   - 콘솔에 명확한 에러 메시지 확인
   - 복구: `NOTION_API_KEY` 다시 추가

2. **Database ID 잘못됨**
   - `.env.local`에서 `NOTION_DATABASE_ID`를 잘못된 값으로 변경
   - 페이지 로드 시도
   - 404 에러 메시지 확인 ("Database 설정 확인 필요")
   - 복구: 올바른 Database ID로 변경

3. **Notion Integration 공유 안 됨**
   - Notion에서 Integration의 Database 공유 제거
   - 페이지 로드 시도
   - 403 에러 메시지 확인 ("접근 권한 확인 필요")
   - 복구: Notion에서 Share > Integration 다시 공유

4. **Rate Limit 테스트** (선택적)
   - `withRetry` 함수에 즉시 실패하는 429 에러 주입
   - 재시도 로직 작동 확인 (3회 시도, exponential backoff)
   - 콘솔에 재시도 로그 출력 확인

**검증 체크리스트**:
- ✅ 각 에러 상황에서 적절한 메시지 표시
- ✅ 사용자가 어떻게 해결해야 하는지 명확함
- ✅ 개발자 콘솔에 상세한 로그 출력
- ✅ 재시도 로직이 자동으로 동작

---

## 📊 전체 진행 체크리스트

### Phase 5.1: ISR 최적화
- [ ] revalidate 값 확인 (app/page.tsx, app/posts/[slug]/page.tsx)
- [ ] 온디맨드 ISR API 구현 (app/api/revalidate/route.ts)
- [ ] 로컬 ISR 테스트 (npm run build && npm run start)
- [ ] Notion 데이터 변경 후 자동 반영 확인

### Phase 5.2: 성능 최적화
- [ ] Image 컴포넌트 적용 (PostCard, 포스트 상세)
- [ ] withRetry 함수 구현
- [ ] 모든 API 호출에 재시도 로직 적용
- [ ] npm run build 실행 & 빌드 시간, 번들 크기 기록
- [ ] 성능 지표 확인 (빌드 < 2분, 번들 < 500KB)

### Phase 5.3: 에러 처리 & 견고성
- [ ] 환경 변수 검증 추가 (API Key, Database ID)
- [ ] 에러 핸들링 강화 (403, 404, 401, 429 등)
- [ ] Zod 스키마 검증 추가 (선택적)
- [ ] 로깅 추가 (조회, 파싱, 에러)
- [ ] 에러 시나리오 테스트 (API Key 누락, DB ID 오류 등)

---

## 🚀 다음 단계
Phase 5.4: Vercel 배포 (Phase 5.1~5.3 완료 후)

---

**작성일**: 2026-06-22  
**버전**: 1.0 (Phase 5.1~5.3 계획)
