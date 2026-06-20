# Notion CMS 개인 블로그 MVP 개발 로드맵

**작성일**: 2026-06-16  
**대상 완성일**: 2026-07-07 (3주 예상)  
**팀 규모**: 1인 개발자  
**배포 대상**: Vercel  

---

## 목차

1. [개요](#개요)
2. [전체 타임라인](#전체-타임라인)
3. [Phase 1: 기초 설정 & Notion API 연동](#phase-1-기초-설정--notion-api-연동)
4. [Phase 2: 홈 페이지 구현](#phase-2-홈-페이지-구현)
5. [Phase 3: 포스트 상세 페이지 & 블록 렌더링](#phase-3-포스트-상세-페이지--블록-렌더링)
6. [Phase 4: 404 페이지 & 전역 레이아웃](#phase-4-404-페이지--전역-레이아웃)
7. [Phase 5: ISR, 최적화 & 배포](#phase-5-isr-최적화--배포)
8. [기술적 의존성 매핑](#기술적-의존성-매핑)
9. [위험 요소 & 완화 전략](#위험-요소--완화-전략)
10. [진행 상황 추적](#진행-상황-추적)

---

## 개요

### 프로젝트 목표

Notion을 CMS로 활용하여, **별도 관리 UI 없이** 블로그 포스트를 작성·게시할 수 있는 개인 블로그 웹사이트를 MVP 수준으로 구축합니다.

### 성공 정의 (Definition of Success)

- Notion DB에서 포스트를 자동으로 페칭하여 블로그에 노출
- 포스트 상세 페이지에서 모든 Notion 블록 타입이 올바르게 렌더링됨
- 태그 기반 필터링이 정상 작동
- OG 메타태그가 동적으로 생성되어 소셜 공유 가능
- ISR을 통해 Notion 변경사항이 자동 반영 (배포 없이)
- Vercel에 배포되어 실제 사용 가능한 상태

### MVP 범위 (포함)

| 기능 ID | 기능명 | 우선순위 |
|---------|--------|---------|
| F001 | Notion 포스트 목록 조회 | P0 |
| F002 | 포스트 상세 렌더링 (블록 타입) | P0 |
| F003 | 태그 기반 필터링 | P0 |
| F004 | ISR (점진적 정적 재생성) | P0 |
| F005 | OG 메타태그 생성 | P1 |
| F010 | Notion API 클라이언트 | P0 |
| F011 | 404 처리 | P0 |
| F012 | 전역 레이아웃 (헤더/푸터) | P0 |

### 제외 사항

- 댓글 시스템, 검색 기능, 뉴스레터, 다크 모드, 조회수 카운터, RSS 피드

### 참고 문서

이 로드맵은 다음 문서와 함께 사용됩니다:

| 문서 | 용도 |
|------|------|
| **docs/NOTION_API_GUIDE.md** | Phase 1-3에서 Notion API 상세 구현 가이드 (DB 설정, API 사용, 블록 렌더링) |
| **docs/PRD.md** | 프로젝트 요구사항 및 기능 명세 |
| **shrimp-rules.md** | AI 개발 규칙 및 코딩 컨벤션 |

**추천 학습 순서:**
1. 이 ROADMAP.md 읽기 (전체 흐름 이해)
2. Phase 시작 전 해당 섹션의 docs/NOTION_API_GUIDE.md 참고
3. 각 작업 시작 전 "성공 기준" 확인

---

## 전체 타임라인

```
Phase 1: 기초 설정 & Notion API 연동     (4-5일)
├─ Notion 환경 설정
├─ 프로젝트 환경 변수 설정
├─ @notionhq/client 래퍼 구현
└─ API 테스트

Phase 2: 홈 페이지 구현                  (4-5일)
├─ getAllPosts() 구현
├─ PostCard 컴포넌트 개발
├─ 레이아웃 (Header/Footer) 초안
└─ 포스트 목록 페이지 완성

Phase 3: 포스트 상세 페이지                (5-6일)
├─ getPost() & getPageBlocks() 구현
├─ BlockRenderer 컴포넌트 개발
├─ Shiki 통합 (코드 강조)
├─ OG 메타태그 구현
└─ 포스트 상세 페이지 완성

Phase 4: 404 & 전역 레이아웃             (2-3일)
├─ not-found.tsx 커스텀 404 페이지
├─ 헤더/푸터 최적화
├─ 태그 필터 UI 완성
└─ 페이지 간 네비게이션 검증

Phase 5: ISR, 최적화 & 배포              (3-4일)
├─ ISR revalidate 설정
├─ 성능 최적화 (캐싱, 이미지 최적화)
├─ 에러 처리 & 테스트
├─ Vercel 배포
└─ 라이브 검증

총 소요 예상 시간: 18-21일 (3주)
```

---

## Phase 1: 기초 설정 & Notion API 연동

**목표**: Notion API와 안정적으로 통신할 수 있는 기반 구축

**소요 기간**: 4-5일

### Phase 1.1: Notion 워크스페이스 설정

**작업**: Notion Integration 생성 및 Database 설정

**세부 작업**:

1. **Notion Integration 생성**
   - 사이트: https://www.notion.so/my-integrations
   - Integration명: "Blog CMS"
   - 권한: Read content, Read user information
   - 결과: Internal Integration Token 획득

2. **Notion Database 생성**
   - 워크스페이스에서 **Blog Posts** 테이블 생성
   - Integration과 공유 (Share → Invite)
   - Database ID 확인 (URL에서 추출)

3. **Database 속성 정의**
   - Title (기본, 제목)
   - Slug (Text, URL 식별자)
   - Published (Checkbox, 게시 여부)
   - PublishedAt (Date, 게시 날짜)
   - Tags (Multi-select, 태그 목록)
   - Excerpt (Text, 요약)
   - Cover (Files & media, 커버 이미지)

4. **테스트 포스트 작성**
   - 최소 2개 포스트 작성 (Published=true)
   - 다양한 블록 타입 포함 (제목, 단락, 코드, 이미지, 목록 등)

**예상 소요 시간**: 1-2시간

**성공 기준**:
- [ ] Integration Token 획득 및 안전하게 보관
- [ ] Database ID 확인
- [ ] 7개 필수 속성 모두 생성됨
- [ ] 테스트 포스트 2개 생성 (Published=true)

**관련 파일**:
- `.env.local` (환경 변수 저장 - Git 제외)
- `docs/NOTION_API_GUIDE.md` (참고)

---

### Phase 1.2: 프로젝트 환경 변수 설정

**작업**: 환경 변수 파일 생성 및 검증

**세부 작업**:

1. **`.env.local` 파일 생성**
   ```bash
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **`.gitignore` 확인**
   - `.env.local` 포함되어 있는지 검증
   - 현재: ✅ 이미 포함됨

3. **로컬 테스트**
   - 개발 서버에서 환경 변수 로드 확인
   - `process.env.NOTION_API_KEY` 접근 테스트

**예상 소요 시간**: 30분

**성공 기준**:
- [ ] `.env.local` 파일 생성 및 정보 입력
- [ ] 파일이 `.gitignore`에 포함
- [ ] 로컬 개발 서버에서 환경 변수 접근 가능

**관련 파일**:
- `.env.local` (새로 생성)
- `.gitignore` (이미 포함됨)

---

### Phase 1.3: @notionhq/client 래퍼 구현

**작업**: Notion API와 통신하는 기본 라이브러리 구현

**세부 작업**:

1. **`lib/notion.ts` 파일 생성**
   - @notionhq/client 초기화
   - API KEY 및 DATABASE_ID 로드
   - 에러 핸들링 (API Key 누락, Database ID 오류 등)

2. **`types/notion.ts` 파일 생성**
   - NotionPost 인터페이스 정의
   - NotionBlock 인터페이스 정의
   - 타입 검증 위한 Zod 스키마 (선택적)

3. **헬퍼 함수 구현** (`lib/notion.ts`)
   - `extractText()`: Title, Slug, Excerpt 추출
   - `extractDate()`: PublishedAt 추출
   - `extractMultiSelect()`: Tags 추출
   - `extractCoverUrl()`: Cover 이미지 URL 추출

4. **에러 처리 로직**
   - API Key 누락: 명확한 에러 메시지
   - Database ID 오류 (404): 설정 확인 안내
   - 403 Forbidden: Integration 공유 확인 안내
   - 429 Rate Limit: 재시도 로직 (선택적, Phase 5에서 강화)

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [x] `lib/notion.ts` 작성 완료 (185줄)
- [x] `types/notion.ts` 정의 완료 (36줄)
- [x] 헬퍼 함수 모두 구현 (extractText, extractDate, extractMultiSelect, extractCoverUrl)
- [x] 에러 핸들링 기본 로직 포함 (NotionAPIError 클래스)

**관련 파일**:
- `lib/notion.ts` (새로 생성)
- `types/notion.ts` (새로 생성)
- `.env.local` (참고)

---

### Phase 1.4: getAllPosts() 함수 구현 & 테스트

**작업**: Notion DB에서 Published 포스트 목록을 조회하는 핵심 함수 구현

**세부 작업**:

1. **`getAllPosts()` 함수 구현**
   - Filter: Published = true
   - Sort: PublishedAt (descending, 최신순)
   - Page size: 100 (페이지네이션 지원)
   - 응답: NotionPost[] 배열

2. **`parsePost()` 헬퍼 함수**
   - Notion Page를 NotionPost로 변환
   - 필수 필드 검증 (title, slug, publishedAt)
   - 선택 필드 처리 (tags, excerpt, coverImage)

3. **테스트 및 검증**
   ```bash
   node -e "require('./lib/notion').getAllPosts().then(console.log)"
   ```
   - 결과: 테스트 포스트 2개 배열로 반환되는지 확인
   - 필드 형식 검증 (id, slug, title, publishedAt, tags 등)

4. **로깅 추가**
   - 조회한 포스트 개수 로그
   - 파싱 오류 발생 시 경고 로그

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [x] `getAllPosts()` 함수 구현 완료
- [x] `parsePost()` 헬퍼 함수 구현
- [x] 로컬 테스트에서 2개 포스트 조회됨 (Phase 2에서 npm run dev로 확인)
- [x] 각 포스트 필드가 올바른 타입으로 파싱됨
- [x] 필수 필드 누락 시 경고 로그 출력

**관련 파일**:
- `lib/notion.ts` (함수 추가)
- `types/notion.ts` (참고)
- `docs/NOTION_API_GUIDE.md` (섹션: 포스트 목록 조회 - F001)

---

### Phase 1 체크포인트 (Checkpoint 1)

**검증 사항**:

1. Notion 환경 설정 완료 (참고: docs/NOTION_API_GUIDE.md)
   - [x] Integration Token 생성됨 (https://www.notion.so/my-integrations)
   - [x] Database ID 확인됨 (URL에서 32자 UUID 추출)
   - [x] 필수 속성 7개 모두 생성됨:
     - [x] Title (기본)
     - [x] Slug (Text)
     - [x] Published (Checkbox)
     - [x] PublishedAt (Date)
     - [x] Tags (Multi-select)
     - [x] Excerpt (Text)
     - [x] Cover (Files & media)
   - [x] 테스트 포스트 2개 (Published=true, 각 5개+ 블록 포함)

2. 로컬 개발 환경 설정
   - [x] `.env.local` 파일 생성
   - [x] `NOTION_API_KEY=secret_xxxxx` 저장됨
   - [x] `NOTION_DATABASE_ID=xxxxx` 저장됨
   - [x] `.gitignore`에 `.env.local` 포함됨
   - [x] `npm run dev` 실행 시 환경 변수 로드 가능

3. 기본 라이브러리 구현 (Phase 1.3 완료)
   - [x] `lib/notion.ts` 작성 완료 (185줄, 클라이언트 초기화, 헬퍼 함수, parsePost, getAllPosts)
   - [x] `types/notion.ts` 정의 완료 (36줄, NotionPost, NotionBlock 인터페이스, Zod 스키마)
   - [x] `getAllPosts()` 함수 구현 완료 (Phase 2에서 npm run dev 실행 시 실제 동작 확인)
   - [x] 각 포스트 필드가 올바른 타입으로 파싱됨:
     - id (string), slug (string), title (string)
     - publishedAt (Date), tags (string[])
     - excerpt (string), coverImage (string | null)
     - isPublished (boolean)

4. 에러 핸들링 검증
   - [x] API Key 누락 시 명확한 에러 메시지
   - [x] Database ID 잘못되었을 때 404 에러 처리
   - [x] Integration이 공유되지 않았을 때 403 에러 처리
   - [x] Rate Limit (429) 에러 처리

**조직 방법**: 진행 상황을 `PROGRESS.md`에 기록 (체크리스트 항목 제거 후 체크 표시)

---

## Phase 2: 홈 페이지 구현

**목표**: 포스트 목록을 렌더링하는 홈 페이지 완성 (F001, F003, F012)

**소요 기간**: 4-5일

### Phase 2.1: 전역 레이아웃 (Header/Footer) 구현

**작업**: 모든 페이지에서 사용할 헤더 및 푸터 컴포넌트 구현

**세부 작업**:

1. **`components/Header.tsx` 컴포넌트 생성**
   - 블로그 타이틀/로고 (링크: 홈으로)
   - 네비게이션 메뉴 (향후 확장용)
   - 기본 구조: `<header>` > `<nav>` > `<Link>`
   - 스타일링: Tailwind CSS

   ```tsx
   // 기본 구조
   <header className="border-b border-gray-200 sticky top-0 z-50">
     <div className="container mx-auto px-4 py-4">
       <div className="flex justify-between items-center">
         <Link href="/" className="text-2xl font-bold">
           블로그 이름
         </Link>
       </div>
     </div>
   </header>
   ```

2. **`components/Footer.tsx` 컴포넌트 생성**
   - 저작권 표시
   - 블로거 간단한 자기소개 (1줄)
   - 소셜 링크 (선택적)

   ```tsx
   // 기본 구조
   <footer className="border-t border-gray-200 mt-16 py-8">
     <div className="container mx-auto px-4 text-center text-sm text-gray-600">
       © 2026 Your Name. All rights reserved.
     </div>
   </footer>
   ```

3. **`app/layout.tsx` (RootLayout) 수정**
   - Header, Footer 포함
   - 기본 메타데이터 설정 (타이틀, 설명)
   - 글로벌 스타일 적용

**예상 소요 시간**: 1.5시간

**성공 기준**:
- [ ] Header 컴포넌트 작성 완료
- [ ] Footer 컴포넌트 작성 완료
- [ ] RootLayout에 통합됨
- [ ] 모든 페이지에서 헤더/푸터 표시됨

**관련 파일**:
- `components/Header.tsx` (새로 생성)
- `components/Footer.tsx` (새로 생성)
- `app/layout.tsx` (수정)

---

### Phase 2.2: PostCard 컴포넌트 개발

**작업**: 포스트 목록에 표시될 카드 컴포넌트 구현

**세부 작업**:

1. **`components/PostCard.tsx` 컴포넌트 생성**
   - Props: NotionPost
   - 렌더링 요소:
     - 커버 이미지 (있을 경우)
     - 포스트 제목
     - 게시 날짜 (형식: YYYY-MM-DD)
     - 태그 목록 (뱃지 형태)
     - 요약(Excerpt)
   
   - 상호작용:
     - 카드 클릭 시 포스트 상세 페이지로 이동
     - 태그 클릭 시 태그 필터링 (/?tag=TAG_NAME)

2. **스타일링**
   - Tailwind CSS로 일관된 디자인
   - 호버 효과 추가 (마우스 오버 시 그림자 강조)
   - 반응형 레이아웃 (모바일 친화적)

3. **shadcn 컴포넌트 활용** (선택적)
   - Card: 카드 레이아웃
   - Badge: 태그 뱃지

```tsx
// 기본 구조
<Link href={`/posts/${post.slug}`}>
  <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
    {post.coverImage && <img src={post.coverImage} alt={post.title} />}
    <div className="p-4">
      <h3 className="text-lg font-bold">{post.title}</h3>
      <time className="text-sm text-gray-500">{post.publishedAt}</time>
      <div className="flex flex-wrap gap-2 mt-2">
        {post.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
      </div>
      <p className="text-sm text-gray-600 mt-2">{post.excerpt}</p>
    </div>
  </div>
</Link>
```

**예상 소요 시간**: 1.5시간

**성공 기준**:
- [ ] PostCard 컴포넌트 작성 완료
- [ ] 모든 필드 렌더링됨
- [ ] 링크 작동 (포스트 상세 페이지로 이동)
- [ ] 태그 클릭 시 필터링 작동
- [ ] 반응형 디자인 적용

**관련 파일**:
- `components/PostCard.tsx` (새로 생성)

---

### Phase 2.3: 태그 필터 UI 구현 (F003)

**작업**: 홈 페이지에서 태그로 포스트를 필터링하는 UI 구현

**세부 작업**:

1. **`getAllTags()` 함수 구현** (`lib/notion.ts`)
   - 모든 포스트에서 고유 태그 추출
   - 알파벳순 정렬
   - 반환: string[] 배열

2. **`components/TagFilter.tsx` 컴포넌트 생성**
   - Props: tags (string[]), selectedTag (optional)
   - 렌더링:
     - "전체" 버튼 (필터 초기화)
     - 각 태그별 필터 버튼
   - 상호작용: 클릭 시 `/?tag=TAG_NAME` 쿼리 파라미터로 이동
   - 선택된 태그 강조 (색상 변경)

3. **스타일링**
   - 선택됨: 파란색 배경, 흰색 글자
   - 미선택: 회색 배경, 호버 시 진회색
   - 패딩/마진 일관성 유지

```tsx
// 기본 구조
<div className="flex flex-wrap gap-2">
  <Link href="/" className={selectedTag ? "bg-gray-200" : "bg-blue-500 text-white"}>
    전체
  </Link>
  {tags.map(tag => (
    <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} 
          className={selectedTag === tag ? "bg-blue-500 text-white" : "bg-gray-200"}>
      {tag}
    </Link>
  ))}
</div>
```

4. **`getPostsByTag()` 함수 구현** (`lib/notion.ts`)
   - Filter: Published = true AND Tags contains TAG_NAME
   - 반환: NotionPost[]

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [ ] `getAllTags()` 함수 구현 및 테스트
- [ ] `getPostsByTag()` 함수 구현 및 테스트
- [ ] TagFilter 컴포넌트 작성 완료
- [ ] 필터 적용 시 포스트 목록 변경됨
- [ ] "전체" 버튼 클릭 시 필터 초기화됨

**관련 파일**:
- `lib/notion.ts` (함수 추가)
- `components/TagFilter.tsx` (새로 생성)

---

### Phase 2.4: 홈 페이지 완성 (`app/page.tsx`)

**작업**: 홈 페이지 최종 구현 및 ISR 설정

**세부 작업**:

1. **`app/page.tsx` 작성**
   - `getAllPosts()` 또는 `getPostsByTag()` 호출
   - 쿼리 파라미터 (tag) 처리
   - 렌더링:
     - 헤더/푸터 (layout.tsx 상속)
     - 제목 ("블로그")
     - TagFilter 컴포넌트
     - PostCard 목록
   - 포스트 없음 상태 처리 (Empty state)

2. **ISR 설정**
   ```tsx
   export const revalidate = 3600; // 1시간마다 재검증
   ```

3. **동적 라우팅 지원**
   ```tsx
   interface HomePageProps {
     searchParams: Promise<{ tag?: string }>;
   }
   
   export default async function Home({ searchParams }: HomePageProps) {
     const params = await searchParams;
     const selectedTag = params.tag;
     // ...
   }
   ```

4. **레이아웃 및 스타일**
   - Container 클래스로 중앙 정렬
   - 포스트 그리드 (grid-cols-1)
   - 여백 및 간격 일관성

```tsx
// 기본 구조
export const revalidate = 3600;

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedTag = params.tag;
  
  const posts = selectedTag 
    ? await getPostsByTag(selectedTag)
    : await getAllPosts();
  
  const allTags = await getAllTags();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">블로그</h1>
      <TagFilter tags={allTags} selectedTag={selectedTag} />
      
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">포스트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
```

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [ ] 홈 페이지 렌더링됨
- [ ] 포스트 목록 표시됨
- [ ] 태그 필터 작동
- [ ] 포스트 카드 클릭 시 상세 페이지 이동 (404는 아직 괜찮음)
- [ ] ISR revalidate 설정됨
- [ ] 포스트 없음 상태 표시됨

**관련 파일**:
- `app/page.tsx` (새로 생성 또는 수정)
- `components/PostCard.tsx` (참고)
- `components/TagFilter.tsx` (참고)

---

### Phase 2 체크포인트 (Checkpoint 2)

**검증 사항**:

1. 홈 페이지 기능 완성
   - [ ] 포스트 목록 렌더링됨
   - [ ] 태그 필터 작동
   - [ ] 포스트 카드 표시 (제목, 날짜, 태그, 요약, 커버 이미지)

2. 레이아웃 및 네비게이션
   - [ ] 헤더 표시 (블로그 타이틀, 홈 링크)
   - [ ] 푸터 표시 (저작권)
   - [ ] 모든 페이지에 헤더/푸터 포함

3. ISR 설정
   - [ ] `export const revalidate = 3600` 설정됨
   - [ ] 로컬 개발에서 동적 재생성 가능 확인

**조직 방법**: `PROGRESS.md`에 Checkpoint 2 기록

---

## Phase 3: 포스트 상세 페이지 & 블록 렌더링

**목표**: Notion 블록을 HTML로 렌더링하는 포스트 상세 페이지 완성 (F002, F004, F005)

**소요 기간**: 5-6일

### Phase 3.1: 포스트 상세 조회 함수 구현

**작업**: Slug 기반 포스트 조회 및 블록 페칭 함수 구현

**세부 작업**:

1. **`getPost()` 함수 구현** (`lib/notion.ts`)
   - 매개변수: slug (문자열)
   - 동작: getAllPosts()에서 slug 일치하는 포스트 찾기
   - 반환: NotionPost | null

2. **`getPageBlocksRecursive()` 함수 구현** (`lib/notion.ts`)
   - 매개변수: pageId (Notion Page ID)
   - 동작: 페이지의 모든 블록을 재귀적으로 조회
   - 페이지네이션 처리 (max 100개씩)
   - 자식 블록 포함 (has_children)
   - 반환: Block[] 배열

```typescript
// 기본 구조
export async function getPageBlocksRecursive(pageId: string): Promise<any[]> {
  const blocks = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const block of response.results) {
      let blockData = { ...block };
      
      if (block.has_children) {
        blockData.children = await getPageBlocksRecursive(block.id);
      }
      
      blocks.push(blockData);
    }

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return blocks;
}
```

3. **테스트**
   - 테스트 포스트 slug로 조회 가능 확인
   - 블록 5-10개 조회 확인

**예상 소요 시간**: 1.5시간

**성공 기준**:
- [ ] `getPost()` 함수 동작
- [ ] `getPageBlocksRecursive()` 함수 동작
- [ ] 블록 배열 반환됨 (최소 5개 이상)
- [ ] 각 블록 타입 (paragraph, heading, code 등) 포함

**관련 파일**:
- `lib/notion.ts` (함수 추가)

---

### Phase 3.2: BlockRenderer 컴포넌트 개발

**작업**: Notion 블록 타입을 React 컴포넌트로 변환하는 렌더러 구현

**참고**: docs/NOTION_API_GUIDE.md - 섹션 7, 8 (블록 조회 및 렌더링)

**세부 작업**:

1. **`components/BlockRenderer.tsx` 컴포넌트 생성**
   - Props: block (Notion 블록 객체), async Server Component
   - 지원 블록 타입 (8가지 주요 타입):
     - paragraph (단락) - rich_text with annotations
     - heading_1, heading_2, heading_3 (제목) - 3단계 계층
     - code (코드 블록) - 언어 지정, Shiki 강조
     - image (이미지) - 파일 또는 외부 URL
     - bulleted_list_item (불릿 목록) - list-disc
     - numbered_list_item (번호 목록) - list-decimal
     - quote (인용) - blockquote 스타일
     - divider (구분선) - hr 태그
   - 기타 타입: null 반환 (toggle, table 등 향후 확장)

2. **각 블록 타입별 렌더링**

   **Paragraph (단락)**
   ```tsx
   case "paragraph":
     return (
       <p className="my-4 text-base leading-relaxed">
         {block.paragraph?.rich_text.map((text: any) => (
           <RichText key={text.id} text={text} />
         ))}
       </p>
     );
   ```

   **Heading (제목)**
   ```tsx
   case "heading_1":
     return (
       <h1 className="text-3xl font-bold my-6">
         {block.heading_1?.rich_text.map((text: any) => text.text.content).join("")}
       </h1>
     );
   // heading_2, heading_3 유사...
   ```

   **Code (코드 블록)**
   - Shiki 통합 (다음 섹션 참고)
   ```tsx
   case "code":
     const code = block.code?.rich_text.map((t: any) => t.text.content).join("");
     const html = await codeToHtml(code, {
       lang: block.code?.language || "plain",
       theme: "github-light",
     });
     return (
       <div
         className="my-4 rounded-lg bg-gray-900 text-white p-4 overflow-x-auto"
         dangerouslySetInnerHTML={{ __html: html }}
       />
     );
   ```

   **Image (이미지)**
   ```tsx
   case "image":
     const imageUrl = block.image?.file?.url || block.image?.external?.url;
     return (
       <figure className="my-8">
         <img src={imageUrl} alt="Post image" className="w-full rounded-lg" />
       </figure>
     );
   ```

   **List Items (목록)**
   ```tsx
   case "bulleted_list_item":
     return (
       <ul className="list-disc list-inside my-4">
         <li>{block.bulleted_list_item?.rich_text.map(t => t.text.content).join("")}</li>
       </ul>
     );
   // numbered_list_item 유사...
   ```

   **Quote (인용)**
   ```tsx
   case "quote":
     return (
       <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
         {block.quote?.rich_text.map(t => t.text.content).join("")}
       </blockquote>
     );
   ```

   **Divider (구분선)**
   ```tsx
   case "divider":
     return <hr className="my-8" />;
   ```

3. **RichText 포맷팅 헬퍼 함수**
   ```tsx
   // bold, italic, strikethrough, code, underline, color 등 처리
   function RichText({ text }: { text: any }) {
     const { bold, italic, strikethrough, code, underline } = text.annotations ?? {};
     
     let className = "";
     if (bold) className += "font-bold ";
     if (italic) className += "italic ";
     if (strikethrough) className += "line-through ";
     if (code) className += "bg-gray-200 px-2 py-1 rounded font-mono text-sm ";
     
     const content = text.text.content;
     
     if (text.href) {
       return (
         <a href={text.href} className="text-blue-600 underline">
           {content}
         </a>
       );
     }
     
     return <span className={className}>{content}</span>;
   }
   ```

**예상 소요 시간**: 2.5-3시간

**성공 기준**:
- [ ] BlockRenderer 컴포넌트 작성 완료
- [ ] 8개 주요 블록 타입 모두 지원
- [ ] RichText 포맷팅 (bold, italic, 링크 등) 동작
- [ ] 코드 블록 테스트 (다음 섹션에서 Shiki 추가)

**관련 파일**:
- `components/BlockRenderer.tsx` (새로 생성)

---

### Phase 3.3: Shiki 통합 (코드 블록 구문 강조)

**작업**: 코드 블록에 구문 강조 추가

**세부 작업**:

1. **Shiki 라이브러리 설정**
   - 이미 package.json에 `shiki@^4.0.2` 설치됨
   - 추가 설정 필요 없음

2. **코드 강조 함수 구현** (`lib/shiki-highlight.ts`)
   ```typescript
   import { codeToHtml } from "shiki";

   export async function highlightCode(
     code: string,
     language: string = "plain"
   ): Promise<string> {
     try {
       const html = await codeToHtml(code, {
         lang: language,
         theme: "github-light",
       });
       return html;
     } catch (error) {
       console.warn(`Shiki: 언어 '${language}' 지원 안 함. 기본 텍스트로 렌더링`);
       return `<pre><code>${escapeHtml(code)}</code></pre>`;
     }
   }
   ```

3. **BlockRenderer 업데이트**
   - Code 블록 렌더링 시 highlightCode() 사용
   - 비동기 처리 (async component)

4. **테스트**
   - JavaScript, TypeScript, Python 등 다양한 언어 코드 블록 테스트
   - 지원하지 않는 언어 fallback 테스트

**예상 소요 시간**: 1-1.5시간

**성공 기준**:
- [ ] 코드 블록에 구문 강조 적용됨
- [ ] 주요 언어 (JavaScript, TypeScript, Python, Java, CSS) 지원
- [ ] 지원하지 않는 언어 시 기본 텍스트로 표시됨

**관련 파일**:
- `lib/shiki-highlight.ts` (새로 생성)
- `components/BlockRenderer.tsx` (수정)

---

### Phase 3.4: 포스트 상세 페이지 구현 (`app/posts/[slug]/page.tsx`)

**작업**: 포스트 상세 페이지 최종 구현

**세부 작업**:

1. **`app/posts/[slug]/page.tsx` 파일 생성**
   - 동적 라우팅: [slug]
   - 비동기 컴포넌트 사용

2. **메타데이터 생성** (generateMetadata)
   ```typescript
   export async function generateMetadata(
     { params }: PostPageProps
   ): Promise<Metadata> {
     const { slug } = await params;
     const post = await getPost(slug);

     if (!post) {
       return { title: "Post not found" };
     }

     return {
       title: post.title,
       description: post.excerpt,
       openGraph: {
         title: post.title,
         description: post.excerpt,
         type: "article",
         publishedTime: post.publishedAt.toISOString(),
         ...(post.coverImage && {
           images: [
             {
               url: post.coverImage,
               width: 1200,
               height: 630,
             },
           ],
         }),
       },
     };
   }
   ```

3. **포스트 조회 & 404 처리**
   ```typescript
   const post = await getPost(slug);
   
   if (!post) {
     notFound(); // Next.js 내장 404 처리
   }
   
   const blocks = await getPageBlocksRecursive(post.id);
   ```

4. **페이지 렌더링 레이아웃**
   ```tsx
   <article className="container mx-auto max-w-3xl py-12">
     {/* 커버 이미지 */}
     {post.coverImage && <img src={post.coverImage} alt={post.title} />}
     
     {/* 메타정보 (제목, 날짜, 태그) */}
     <header>
       <h1>{post.title}</h1>
       <time>{post.publishedAt}</time>
       {post.tags.map(tag => <a href={`/?tag=${tag}`}>{tag}</a>)}
     </header>
     
     {/* 본문 (블록 렌더링) */}
     <main>
       {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
     </main>
   </article>
   ```

5. **ISR 설정**
   ```typescript
   export const revalidate = 3600; // 1시간
   ```

6. **동적 경로 생성** (선택적, Phase 5에서 강화)
   ```typescript
   export async function generateStaticParams() {
     const posts = await getAllPosts();
     return posts.map(post => ({ slug: post.slug }));
   }
   ```

**예상 소요 시간**: 2.5-3시간

**성공 기준**:
- [ ] 포스트 상세 페이지 렌더링됨
- [ ] 커버 이미지 표시됨
- [ ] 제목, 날짜, 태그 표시됨
- [ ] 블록 렌더링됨 (모든 타입)
- [ ] OG 메타태그 생성됨 (검사: 브라우저 개발자 도구)
- [ ] 존재하지 않는 slug 접근 시 404 페이지로 이동 (next: Phase 4)

**관련 파일**:
- `app/posts/[slug]/page.tsx` (새로 생성)
- `components/BlockRenderer.tsx` (참고)
- `lib/notion-blog.ts` (참고)

---

### Phase 3 체크포인트 (Checkpoint 3)

**검증 사항**:

1. 포스트 상세 페이지 기능
   - [ ] 포스트 정보 표시됨 (제목, 날짜, 태그)
   - [ ] 모든 블록 타입 렌더링됨
   - [ ] 코드 블록 구문 강조 적용됨
   - [ ] 태그 클릭 시 홈 페이지 필터 적용되어 이동

2. OG 메타태그
   - [ ] 페이지 소스에서 og:title, og:description, og:image 확인
   - [ ] 소셜 공유 시뮬레이터(Facebook, Twitter) 테스트

3. 네비게이션
   - [ ] 홈에서 포스트 카드 클릭 시 상세 페이지 이동
   - [ ] 포스트 상세에서 헤더 타이틀 클릭 시 홈으로 이동

---

## Phase 4: 404 페이지 & 전역 레이아웃

**목표**: 커스텀 404 페이지 및 전역 레이아웃 최적화 (F011, F012)

**소요 기간**: 2-3일

### Phase 4.1: 커스텀 404 페이지 구현

**작업**: Next.js `not-found.tsx`를 사용한 404 페이지 구현

**세부 작업**:

1. **`app/not-found.tsx` 파일 생성**
   - 역할: 모든 존재하지 않는 경로 처리
   - 호출 시점:
     - 포스트 상세 페이지에서 `notFound()` 호출 시
     - Published=false 포스트 접근 시
     - 존재하지 않는 URL 접근 시

2. **404 페이지 디자인**
   ```tsx
   <div className="container mx-auto py-16 text-center">
     <h1 className="text-5xl font-bold mb-4">404</h1>
     <p className="text-xl text-gray-600 mb-8">
       요청하신 페이지를 찾을 수 없습니다.
     </p>
     <Link href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded">
       홈으로 돌아가기
     </Link>
   </div>
   ```

3. **헤더/푸터 포함**
   - not-found.tsx는 RootLayout을 상속받지 않음
   - 별도로 Header, Footer 포함 필요 (또는 layout 그룹 사용)

4. **테스트**
   - 존재하지 않는 경로 접근: `/nonexistent`
   - 존재하지 않는 포스트: `/posts/invalid-slug`
   - Published=false 포스트 접근

**예상 소요 시간**: 1시간

**성공 기준**:
- [ ] 404 페이지 렌더링됨
- [ ] 홈으로 이동 버튼 작동
- [ ] 모든 불가능한 경로에서 404 표시됨

**관련 파일**:
- `app/not-found.tsx` (새로 생성)

---

### Phase 4.2: 헤더/푸터 최적화

**작업**: Header, Footer 컴포넌트 개선 및 최적화

**세부 작업**:

1. **Header 개선**
   - 블로그 타이틀 설정 (환경 변수 또는 상수)
   - 네비게이션 메뉴 정리
   - 모바일 반응형 고려
   - Sticky positioning 확인

2. **Footer 개선**
   - 저작권 연도 동적 처리 (new Date().getFullYear())
   - 블로거 정보 추가 가능 (선택적)
   - 소셜 링크 (선택적)

3. **전역 스타일 일관성 검증**
   - 컬러 스킴 일관성
   - 폰트 크기/두께 일관성
   - 여백 및 간격 일관성

**예상 소요 시간**: 1시간

**성공 기준**:
- [ ] Header 스타일 일관성 확인
- [ ] Footer 스타일 일관성 확인
- [ ] 모든 페이지에서 동일하게 표시됨

**관련 파일**:
- `components/Header.tsx` (수정)
- `components/Footer.tsx` (수정)

---

### Phase 4.3: 태그 필터 UI 최적화 & 통합 테스트

**작업**: 홈 페이지와 포스트 상세 페이지의 태그 필터링 통일

**세부 작업**:

1. **TagFilter 컴포넌트 최적화**
   - 반응형 디자인 확인
   - 태그 개수가 많을 때 UI (스크롤 또는 페이지네이션)
   - 모바일에서 보기 좋은 배치

2. **포스트 상세에서 태그 필터링**
   - 태그 클릭 시 홈 페이지로 이동 + 쿼리 파라미터 추가
   ```tsx
   <a href={`/?tag=${encodeURIComponent(tag)}`}>#{tag}</a>
   ```

3. **통합 테스트**
   - 홈 → 필터 → 상세 → 필터 → 홈 네비게이션 검증
   - 다양한 태그 조합 테스트
   - 필터 없을 때 전체 목록 표시 검증

**예상 소요 시간**: 1.5시간

**성공 기준**:
- [ ] 태그 필터링 일관되게 작동
- [ ] 포스트 상세에서 태그 클릭 시 홈 필터 적용
- [ ] 모바일에서 UI 가독성 확인

**관련 파일**:
- `components/TagFilter.tsx` (최적화)
- `app/posts/[slug]/page.tsx` (수정)

---

### Phase 4 체크포인트 (Checkpoint 4)

**검증 사항**:

1. 404 페이지
   - [ ] 404 페이지 렌더링됨
   - [ ] 홈 버튼 작동

2. 전역 레이아웃
   - [ ] 모든 페이지에 헤더/푸터 포함
   - [ ] 스타일 일관성 유지

3. 네비게이션 통합
   - [ ] 홈 ↔ 포스트 상세 네비게이션
   - [ ] 태그 필터링 일관성
   - [ ] 404 페이지 네비게이션

---

## Phase 5: ISR, 최적화 & 배포

**목표**: 성능 최적화, ISR 강화, Vercel 배포 (F004)

**소요 기간**: 3-4일

### Phase 5.1: ISR (Incremental Static Regeneration) 최적화

**작업**: ISR 설정 강화 및 온디맨드 재검증

**세부 작업**:

1. **revalidate 값 설정 확인**
   ```typescript
   // app/page.tsx
   export const revalidate = 3600; // 1시간
   
   // app/posts/[slug]/page.tsx
   export const revalidate = 3600; // 1시간
   ```

2. **온디맨드 ISR 구현** (선택적, Vercel only)
   - API Route: `/api/revalidate`
   - 목적: Notion 변경 후 수동 재검증 트리거
   
   ```typescript
   // app/api/revalidate/route.ts
   import { revalidatePath, revalidateTag } from "next/cache";
   import { NextRequest, NextResponse } from "next/server";

   export async function POST(request: NextRequest) {
     const secret = request.nextUrl.searchParams.get("secret");

     if (secret !== process.env.REVALIDATE_SECRET) {
       return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
     }

     try {
       revalidatePath("/");
       revalidateTag("posts");
       return NextResponse.json({ revalidated: true });
     } catch (err) {
       return NextResponse.json({ revalidated: false, message: "Error revalidating" }, { status: 500 });
     }
   }
   ```

3. **테스트**
   - 로컬: `npm run build` 후 `npm run start` 에서 ISR 동작 확인
   - 배포 후: Notion 데이터 변경 → 일정 시간 후 자동 반영 확인

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [ ] ISR revalidate 설정됨
- [ ] 빌드 후 정적 페이지 생성됨
- [ ] revalidate 시간 후 재생성 가능 (Vercel 배포 후 확인)

**관련 파일**:
- `app/page.tsx` (확인)
- `app/posts/[slug]/page.tsx` (확인)
- `app/api/revalidate/route.ts` (새로 생성, 선택적)

---

### Phase 5.2: 성능 최적화

**작업**: 이미지 최적화, 캐싱 전략, 번들 크기 감소

**세부 작업**:

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용 (PostCard, 포스트 상세 커버)
   
   ```tsx
   import Image from "next/image";
   
   // PostCard에서
   {post.coverImage && (
     <Image
       src={post.coverImage}
       alt={post.title}
       width={400}
       height={200}
       className="w-full h-48 object-cover"
     />
   )}
   ```

2. **Notion API 캐싱 및 Rate Limiting 강화**
   - **ISR + 시간 기반 캐싱**: `export const revalidate = 3600` (1시간)
   - **요청별 재시도 로직**: Exponential Backoff (참고: docs/NOTION_API_GUIDE.md)
   - **Rate Limit 대응**: 429 에러 시 자동 재시도 (최대 3회)
   
   ```typescript
   // lib/notion.ts에 추가
   const MAX_RETRIES = 3;
   const INITIAL_DELAY = 1000; // 1초

   export async function withRetry<T>(
     fn: () => Promise<T>,
     retries = MAX_RETRIES
   ): Promise<T> {
     try {
       return await fn();
     } catch (error: any) {
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

   // getAllPosts() 호출 시 적용
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
   ```

   **효과**: Notion API 3req/sec 제한에 대한 자동 대응

3. **번들 크기 확인**
   ```bash
   npm run build
   # .next/static/ 폴더 크기 확인
   ```

4. **동적 임포트** (선택적)
   - BlockRenderer 같은 무거운 컴포넌트는 dynamic import 고려

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [ ] Image 컴포넌트 적용됨
- [ ] 캐싱 설정 확인
- [ ] 빌드 시간 < 2분 (로컬)
- [ ] 번들 크기 합리적 (각 페이지 < 500KB)

**관련 파일**:
- `components/PostCard.tsx` (수정)
- `app/posts/[slug]/page.tsx` (수정)
- `lib/notion.ts` (rate limiting 추가)

---

### Phase 5.3: 에러 처리 & 견고성 강화

**작업**: 에러 시나리오 처리 및 로깅 추가

**세부 작업**:

1. **API 에러 핸들링 강화**
   ```typescript
   // lib/notion.ts에 추가
   
   // 1. API Key 누락
   if (!process.env.NOTION_API_KEY) {
     throw new Error("NOTION_API_KEY 환경 변수가 설정되지 않았습니다.");
   }

   // 2. 에러 타입별 처리
   try {
     // API 호출
   } catch (error: any) {
     if (error.status === 403) {
       console.error("Integration이 Database에 공유되지 않았습니다.");
       throw new Error("Notion 접근 권한 확인 필요");
     } else if (error.status === 404) {
       console.error("Database ID가 잘못되었습니다.");
       throw new Error("Notion Database 설정 확인 필요");
     } else if (error.status === 429) {
       console.warn("Rate limit 초과. 재시도 중...");
       return withRetry(() => /* 호출 */);
     } else {
       throw error;
     }
   }
   ```

2. **Notion API 응답 검증**
   ```typescript
   // Zod를 사용한 검증 (선택적)
   import { z } from "zod";

   const NotionPostSchema = z.object({
     id: z.string(),
     slug: z.string(),
     title: z.string(),
     publishedAt: z.coerce.date(),
     tags: z.array(z.string()).default([]),
     excerpt: z.string().default(""),
     coverImage: z.string().nullable().default(null),
     isPublished: z.boolean().default(false),
   });
   ```

3. **로깅 추가**
   ```typescript
   console.log(`[Notion API] 포스트 ${posts.length}개 조회됨`);
   console.warn(`[Notion API] 포스트 ID ${page.id} 파싱 실패: 필수 필드 누락`);
   console.error(`[Notion API] Database 조회 실패:`, error.message);
   ```

4. **테스트 시나리오**
   - [ ] API Key 누락 상태 테스트
   - [ ] Database ID 잘못된 상태 테스트
   - [ ] 네트워크 오류 상황 (로컬에서 재현 어려움, Vercel에서 주의 깊게 모니터링)

**예상 소요 시간**: 1.5시간

**성공 기준**:
- [ ] 에러 시나리오별 명확한 에러 메시지 출력
- [ ] 로깅 정보 기록됨
- [ ] 재시도 로직 작동

**관련 파일**:
- `lib/notion.ts` (에러 처리 강화)
- `components/BlockRenderer.tsx` (fallback 처리)

---

### Phase 5.4: Vercel 배포

**작업**: 프로젝트를 Vercel에 배포하고 라이브 검증

**세부 작업**:

1. **Vercel 연결 및 배포 설정**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - 추가 항목:
     ```
     NOTION_API_KEY=secret_xxxxx
     NOTION_DATABASE_ID=xxxxx
     REVALIDATE_SECRET=xxxxx (선택적)
     ```

3. **빌드 및 배포 테스트**
   - Vercel 대시보드에서 배포 상태 확인
   - Build 로그 검토 (에러 없음 확인)
   - 배포된 URL에서 기능 테스트:
     - 홈 페이지 포스트 목록
     - 포스트 상세 페이지
     - 태그 필터링
     - 404 페이지
     - OG 메타태그 (소셜 공유 테스트)

4. **라이브 환경 검증 체크리스트** (꼭 필요한 항목)
   
   **기본 기능 검증**:
   ```
   ✅ 홈 페이지 로드 (포스트 목록 2개 이상 표시)
   ✅ 포스트 상세 페이지 로드 (제목, 날짜, 태그 표시)
   ✅ 모든 블록 타입 렌더링 (단락, 제목, 코드, 이미지, 목록 확인)
   ✅ 코드 블록 구문 강조 (JavaScript, Python 등 언어별 색상 확인)
   ✅ 이미지 로드 (PostCard 커버, 포스트 커버 이미지 표시)
   ```

   **네비게이션 및 필터링**:
   ```
   ✅ 태그 필터링 작동 (홈 > 태그 클릭 > 필터된 목록)
   ✅ 포스트 카드 클릭 → 상세 페이지 이동
   ✅ 포스트 상세 태그 클릭 → 홈 필터 적용
   ✅ 헤더 타이틀 클릭 → 홈으로 이동
   ✅ 존재하지 않는 포스트 접근 → 404 페이지
   ```

   **SEO 및 공유**:
   ```
   ✅ 페이지 소스에 og:title, og:description 확인
   ✅ og:image 포함 (커버 이미지 URL)
   ✅ 페이지 title 태그 확인 (포스트 제목)
   ```

   **반응형 디자인**:
   ```
   ✅ 모바일 (320px): 포스트 목록, 상세 페이지 가독성
   ✅ 태블릿 (768px): 레이아웃 조정 확인
   ✅ 데스크톱 (1024px+): 전체 레이아웃
   ```

   **성능** (선택적):
   ```
   ⚡ Lighthouse 성능 점수 > 80 (목표)
   ⚡ 홈 페이지 로드 시간 < 3초
   ⚡ 포스트 상세 로드 시간 < 3초
   ```

5. **성능 모니터링** (선택적)
   - Vercel Analytics 활성화
   - Lighthouse 점수 확인 (목표: Performance > 80)

**예상 소요 시간**: 1.5-2시간

**성공 기준**:
- [ ] Vercel 배포 성공
- [ ] 라이브 URL에서 모든 기능 작동
- [ ] 환경 변수 설정 완료
- [ ] 빌드 에러 없음

**관련 파일**:
- `vercel.json` (선택적, 빌드 설정)

---

### Phase 5.5: 최종 테스트 & 문서화

**작업**: 통합 테스트 및 배포 후 문서화

**세부 작업**:

1. **전체 기능 통합 테스트**
   
   **시나리오 1: 신규 방문자 경험**
   - 홈 페이지 접속 → 포스트 목록 보기
   - 포스트 클릭 → 상세 페이지 읽기
   - 태그 클릭 → 필터링된 목록 보기
   - 포스트 상세에서 헤더 클릭 → 홈 이동
   
   **시나리오 2: 다양한 콘텐츠 확인**
   - 다양한 블록 타입 렌더링 (텍스트, 제목, 코드, 이미지, 목록)
   - 코드 블록 구문 강조 (JavaScript, Python 등)
   - 리치 텍스트 포맷팅 (bold, italic, 링크)
   
   **시나리오 3: 에러 처리**
   - 존재하지 않는 경로 접근 → 404
   - Published=false 포스트 접근 → 404

2. **모바일 반응형 테스트**
   - 홈 페이지 (모바일 뷰)
   - 포스트 상세 (모바일 뷰)
   - 태그 필터 (모바일 스크롤)

3. **배포 후 문서화**
   - `DEPLOYMENT.md` 파일 작성 (선택적)
     - 배포 방법
     - 환경 변수 설정
     - ISR 설정
     - 모니터링 및 트러블슈팅

4. **Notion 블로거를 위한 가이드 작성** (선택적)
   - 포스트 작성 방법
   - 필수 속성 입력 방법
   - 권장 블록 타입

**예상 소요 시간**: 1-1.5시간

**성공 기준**:
- [ ] 3개 시나리오 모두 통과
- [ ] 모바일 UI 검증 완료
- [ ] 배포 후 Notion 데이터 변경 시 자동 반영 확인 (1시간 후)

**관련 파일**:
- `DEPLOYMENT.md` (새로 생성, 선택적)
- `README.md` (업데이트)

---

### Phase 5 체크포인트 (Checkpoint 5 - 최종)

**검증 사항**:

1. ISR 동작
   - [ ] 로컬 빌드 후 revalidate 시간 설정 확인
   - [ ] Vercel 배포 후 Notion 데이터 변경 시 자동 반영

2. 성능
   - [ ] 이미지 최적화 적용됨
   - [ ] 빌드 시간 합리적 (< 2분)
   - [ ] 라이브 성능 양호

3. 에러 처리
   - [ ] API 에러 시 적절한 메시지 표시
   - [ ] 404 페이지 정상 작동

4. 라이브 검증
   - [ ] Vercel URL에서 모든 기능 작동
   - [ ] OG 메타태그 확인 (Twitter, Facebook 공유 테스트)
   - [ ] 모바일 반응형 확인

---

## 기술적 의존성 매핑

### 외부 의존성 (npm packages)

| 패키지 | 용도 | Phase | 상태 |
|--------|------|-------|------|
| @notionhq/client | Notion API | 1 | ✅ 설치됨 |
| next | 프레임워크 | 1 | ✅ 설치됨 |
| react, react-dom | UI 라이브러리 | 1 | ✅ 설치됨 |
| typescript | 타입 안전성 | 1 | ✅ 설치됨 |
| tailwindcss | 스타일링 | 2 | ✅ 설치됨 |
| shadcn | UI 컴포넌트 | 2 | ✅ 설치됨 (선택적) |
| lucide-react | 아이콘 | 2 | ✅ 설치됨 |
| shiki | 코드 강조 | 3 | ✅ 설치됨 |
| zod | 검증 (선택적) | 5 | ✅ 설치됨 |

### 내부 의존성

```
Phase 1 (기초)
├─ lib/notion.ts (Notion API 클라이언트)
└─ types/notion.ts (TypeScript 타입)

Phase 2 (홈 페이지)
├─ lib/notion.ts (getAllPosts, getAllTags, getPostsByTag)
├─ components/Header.tsx
├─ components/Footer.tsx
├─ components/PostCard.tsx (← NotionPost)
├─ components/TagFilter.tsx
└─ app/page.tsx

Phase 3 (상세 페이지)
├─ lib/notion.ts (getPost, getPageBlocksRecursive)
├─ lib/shiki-highlight.ts (코드 강조)
├─ components/BlockRenderer.tsx
├─ components/RichText.tsx (← BlockRenderer)
└─ app/posts/[slug]/page.tsx

Phase 4 (404 & 레이아웃)
├─ app/not-found.tsx
├─ components/Header.tsx (최적화)
└─ components/Footer.tsx (최적화)

Phase 5 (배포)
├─ app/api/revalidate/route.ts (선택적)
└─ Vercel 환경 설정
```

---

## 위험 요소 & 완화 전략

### 위험 1: Notion API Rate Limiting (높음)

**설명**: 3개 요청/초 제한으로 빈번한 API 호출 시 429 에러 발생

**영향**: 빌드 시 포스트 목록 + 상세 조회 시 병목

**완화 전략**:
1. ISR 및 캐싱 활용 (매번 호출 X)
2. 재시도 로직 구현 (`withRetry()`)
3. Phase 5에서 `unstable_cache` 강화

**모니터링**: Vercel 로그에서 429 에러 모니터링

---

### 위험 2: Notion API 응답 스키마 변경 (중간)

**설명**: Notion이 API 응답 형식을 변경할 수 있음

**영향**: 파싱 로직 오류, 필드 누락

**완화 전략**:
1. Zod로 응답 검증 (Phase 5)
2. 필드 누락 시 안전한 기본값 처리
3. 로깅 추가로 조기 감지

---

### 위험 3: 포스트가 없을 때 (낮음)

**설명**: Notion DB에 Published=true 포스트가 없을 경우

**영향**: 홈 페이지 empty state 표시

**완화 전략**:
1. Empty state 메시지 ("게시된 포스트가 없습니다")
2. Phase 2에서 이미 처리됨

---

### 위험 4: 블록 타입 지원 부족 (중간)

**설명**: 지원하지 않는 Notion 블록 타입이 있을 경우

**영향**: 일부 콘텐츠가 렌더링되지 않음

**완화 전략**:
1. 8가지 주요 블록 타입 지원 (Phase 3)
2. 미지원 타입은 조용히 스킵 (null 반환)
3. 필요 시 향후 확장 (Phase 이후)

---

### 위험 5: Notion 파일 URL 만료 (중간)

**설명**: Notion 서버에 업로드된 이미지 URL 만료

**영향**: 시간 지남에 따라 이미지 깨짐

**완화 전략**:
1. 외부 URL (Unsplash 등) 권장
2. 커버 이미지는 CDN 사용 권장
3. 블로거 가이드에서 안내

---

### 위험 6: 빌드 시간 초과 (낮음)

**설명**: 포스트가 많을 경우 빌드 시간 장시간 소요

**영향**: Vercel 배포 지연, 시간 초과 가능성

**완화 전략**:
1. ISR 및 동적 경로 생성으로 초기 빌드 최소화
2. Phase 5에서 `generateStaticParams` 설정
3. `dynamicParams = false` 옵션으로 필요한 경우만 빌드

---

## 진행 상황 추적

### 추적 방법

1. **PROGRESS.md 파일 사용**
   ```
   # 진행 상황 추적
   
   ## Phase 1: 기초 설정 & Notion API 연동
   
   ### Phase 1.1: Notion 워크스페이스 설정
   - [x] Notion Integration 생성
   - [x] Database 생성 및 Integration 공유
   - [x] 7개 필수 속성 정의
   - [x] 테스트 포스트 2개 작성
   
   ### Phase 1.2: 프로젝트 환경 변수 설정
   - [x] .env.local 파일 생성
   - [x] NOTION_API_KEY, NOTION_DATABASE_ID 저장
   - [x] .gitignore 확인
   
   ... (이하 생략)
   ```

2. **체크포인트 기반 추적**
   - Phase 완료 후 Checkpoint 검증
   - 각 Checkpoint별로 파일 커밋

3. **Git 커밋 메시지**
   ```
   Phase 1.1: Notion 워크스페이스 및 API 설정 완료
   - Integration 생성 및 Token 획득
   - Database 생성 및 7개 속성 정의
   - 테스트 포스트 2개 작성
   
   Phase 1.2: 프로젝트 환경 변수 설정
   - .env.local 파일 생성
   - 환경 변수 로드 검증
   
   Phase 1.3: Notion API 클라이언트 구현
   - lib/notion.ts 작성
   - types/notion.ts 정의
   - 헬퍼 함수 구현
   
   Phase 1 Checkpoint: 기초 설정 완료
   - 모든 4개 Phase 1 작업 완료
   - getAllPosts() 함수 테스트 완료
   ```

---

## 추가 노트

### 시간 추정 명시

- 예상 소요 시간은 1인 개발자 기준
- 실제 소요 시간은 변할 수 있음 (Notion API 학습 곡선, 디버깅 등)
- 여유시간 포함 (총 3주 = 21일, 개발 일정 18일)

### 선택적 기능

- **Zod 검증** (Phase 5)
- **온디맨드 ISR API** (Phase 5)
- **shadcn UI 컴포넌트** (Phase 2)
- **동적 경로 사전 생성** (Phase 5)

### 향후 확장 (MVP 이후)

- 댓글 시스템 (Giscus)
- 검색 기능 (Algolia 또는 Meilisearch)
- RSS 피드
- 다크 모드
- 조회수 카운터

---

---

## 개발 시작 전 체크리스트

이 로드맵을 시작하기 전에 다음을 확인하세요:

### 사전 준비
- [ ] Node.js 18+ 설치 확인
- [ ] Git 저장소 초기화 완료
- [ ] package.json 의존성 설치 (`npm install`)
- [ ] TypeScript 설정 확인 (tsconfig.json)
- [ ] Next.js 16.2.2+ 설치 확인

### 문서 검토
- [ ] 이 ROADMAP.md 전체 읽기 완료
- [ ] docs/PRD.md 요구사항 이해
- [ ] docs/NOTION_API_GUIDE.md 북마크 추가
- [ ] shrimp-rules.md 개발 규칙 숙지

### 외부 계정 준비
- [ ] Notion 워크스페이스 접근 권한 확인
- [ ] Notion Integration 생성 권한 확인 (관리자 권한 필요)
- [ ] Vercel 계정 생성 (배포용)
- [ ] GitHub 저장소 연결 (Vercel 배포 시)

---

## 로드맵 사용 방법

**단계별 진행:**

1. **Phase 1 시작 → Checkpoint 1 완료**
   - 해당 섹션 읽기
   - 성공 기준 체크리스트로 진행
   - 완료 후 Checkpoint 1 검증

2. **각 Phase 간 Git 커밋**
   ```bash
   git commit -m "Phase 1 Checkpoint: Notion API 클라이언트 구현 완료"
   ```

3. **차단 발생 시**
   - docs/NOTION_API_GUIDE.md 해당 섹션 재검토
   - shrimp-rules.md의 에러 처리 부분 참고
   - docs/PRD.md의 관련 기능 확인

4. **일정 지연 시**
   - Phase 5의 선택적 기능 제거 (Zod, 온디맨드 ISR)
   - 최소 MVP 기능만 우선 구현
   - 배포 후 개선

---

## FAQ

**Q: Phase 별로 다른 날짜에 진행해도 되나요?**  
A: 네. Phase는 순서대로 진행해야 하지만, 각 Phase의 소요 기간은 예상치입니다. 실제 일정은 유연하게 조정하세요.

**Q: 모든 작업을 완료하지 못하면 어떻게 하나요?**  
A: Phase 5의 선택적 기능(Zod, 온디맨드 ISR 등)부터 제거하세요. Phase 1-4만 완료해도 MVP는 배포 가능합니다.

**Q: Notion 데이터를 변경했는데 사이트에 반영이 안 됩니다.**  
A: ISR의 revalidate 시간(1시간)을 기다리거나, Phase 5.1의 온디맨드 ISR API를 구현하세요.

**Q: 특정 Notion 블록 타입이 렌더링되지 않습니다.**  
A: Phase 3.2의 BlockRenderer에 해당 타입을 추가하면 됩니다. docs/NOTION_API_GUIDE.md 섹션 7-8 참고.

---

**로드맵 버전**: 1.1 (NOTION_API_GUIDE.md 연계 개선)  
**작성일**: 2026-06-16  
**마지막 업데이트**: 2026-06-16  
**작성자**: Claude Code (AI Assistant)  
**관련 문서**: docs/NOTION_API_GUIDE.md, docs/PRD.md, shrimp-rules.md
