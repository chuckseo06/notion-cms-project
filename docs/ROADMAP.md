# Notion CMS 개인 블로그 MVP 개발 로드맵

**작성일**: 2026-06-16  
**마지막 업데이트**: 2026-06-22  
**현재 진행**: Phase 5 완료! 🎉 (Vercel 라이브 배포)  
**팀 규모**: 1인 개발자  
**배포 대상**: Vercel  

---

## 🚨 중요 교훈: Phase 1 구현 시 발생한 문제 분석

### 원인
Phase 1.3-1.4 구현 중 **6시간 이상** "Invalid request URL" (400) 에러 발생. 근본 원인은 3가지:

#### 1️⃣ **Notion API 엔드포인트 변경** (최신 SDK 버전)
- `@notionhq/client v5.22.0`은 Notion API `2025-09-03` 기준으로 작성됨
- **제거됨**: `notion.databases.query()` 메서드
- **신규**: `notion.dataSources.query()` 메서드로 대체
- 이전 문서/튜토리얼은 구 엔드포인트 기반이므로 참고 시 주의 필요

#### 2️⃣ **Client baseUrl 설정 버그**
```typescript
// ❌ 잘못된 코드
new Client({
  auth: NOTION_API_KEY,
  baseUrl: "https://api.notion.com/v1",  // 이중 경로화!
})

// ✅ 올바른 코드
new Client({
  auth: NOTION_API_KEY,  // baseUrl 제거 (자동 설정됨)
})
```
- SDK 내부에서 baseUrl 뒤에 경로를 추가하므로 → `/v1/v1/...` 가 됨
- 결과: 400 Bad Request

#### 3️⃣ **extractText() 함수 불완전**
```typescript
// ❌ 기존 코드 (rich_text 타입 미지원)
export function extractText(property: any): string {
  if (!property || property.type !== "title") return "";
  return property.title.map(...).join("");
}

// ✅ 수정된 코드
export function extractText(property: any): string {
  if (!property) return "";
  
  if (property.type === "title") {
    return (property.title ?? []).map((item: any) => item.plain_text).join("");
  }
  
  if (property.type === "rich_text") {  // ← 추가
    return (property.rich_text ?? []).map((item: any) => item.plain_text).join("");
  }
  
  return "";
}
```
- Slug, Excerpt는 Notion의 `rich_text` 타입 속성
- 미지원으로 인해 `slug = ""` → `parsePost()` 필수 필드 검증 실패

### 해결 방법
1. `lib/notion.ts`에서 baseUrl 제거
2. `getAllPosts()` 함수를 `dataSources.query()` 사용하도록 변경
3. `extractText()`에 rich_text 타입 처리 추가

### 향후 개발자 가이드
- **SDK 업데이트 확인**: 새 minor 버전 설치 시 `node_modules/@notionhq/client/package.json`의 `version` 확인
- **API 문서 우선 참고**: Notion SDK 타입정의 확인 → `node_modules/@notionhq/client/build/src/api-endpoints/`
- **테스트 환경 필수**: 실제 Notion DB에서 테스트 포스트로 검증 (mocked 데이터 X)

---

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

### Phase 1 체크포인트 (Checkpoint 1) ✅ 완료

**검증 사항** (2026-06-21):

1. **Notion 환경 설정**
   - [x] Integration Token 생성 (https://www.notion.so/my-integrations)
   - [x] Database ID 확인 (UUID 32자)
   - [x] 필수 속성 7개: Title, Slug, Published, PublishedAt, Tags, Excerpt, Cover
   - [x] 테스트 포스트 2개 (Published=true, 5개+ 블록)

2. **개발 환경 설정**
   - [x] `.env.local` 파일 생성 (NOTION_API_KEY, NOTION_DATABASE_ID)
   - [x] `.gitignore` 확인
   - [x] 환경 변수 로드 테스트

3. **라이브러리 구현**
   - [x] `lib/notion.ts`: @notionhq/client 초기화, 헬퍼 함수 (extractText, extractDate, extractMultiSelect, extractCoverUrl)
   - [x] `types/notion.ts`: NotionPost, NotionBlock 인터페이스, Zod 스키마
   - [x] `getAllPosts()`: dataSources.query() 사용, Filter/Sort
   - [x] `parsePost()`: 필드 파싱 및 검증 (title, slug, publishedAt 필수)

4. **에러 핸들링**
   - [x] API Key 누락 → 명확한 메시지
   - [x] Database ID 오류 → 404 처리
   - [x] Integration 미공유 → 403 처리
   - [x] Rate Limit → 429 처리

**완료**: 2026-06-21 (예상 4-5일 → 실제 3일, Notion API 엔드포인트 변경으로 지연)

---

## Phase 2: 홈 페이지 구현

**목표**: 포스트 목록을 렌더링하는 홈 페이지 완성 (F001, F003, F012)

**소요 기간**: 4-5일

### Phase 2.1: 전역 레이아웃 (Header/Footer) 구현

**작업**: 모든 페이지에서 사용할 헤더 및 푸터 컴포넌트 구현

1. **`components/Header.tsx`**: 블로그 타이틀/로고 + 네비게이션 (sticky, Tailwind CSS)
2. **`components/Footer.tsx`**: 저작권 + 블로거 정보 (연도 동적 처리)
3. **`app/layout.tsx`**: Header, Footer 통합, 기본 메타데이터

**성공 기준**:
- [x] Header/Footer 컴포넌트 완성
- [x] RootLayout 통합
- [x] 모든 페이지에 표시

---

### Phase 2.2: PostCard 컴포넌트 개발

**작업**: 포스트 카드 컴포넌트 (Props: NotionPost)

**구현 내용**:
- 커버 이미지 + 제목 + 날짜 + 태그 뱃지 + 요약
- 카드 클릭: 포스트 상세로 이동
- 태그 클릭: 홈에서 필터 적용 (/?tag=TAG_NAME)
- Tailwind CSS 호버 효과 + 반응형

**성공 기준**: ✅ 모든 필드 렌더링 | 링크/필터 작동

---

### Phase 2.3: 태그 필터 UI 구현 (F003)

**작업**: 홈 페이지에서 태그로 포스트 필터링

**구현 내용**:
- `getAllTags()`: 모든 포스트에서 고유 태그 추출 → 알파벳순 정렬
- `getPostsByTag(tag)`: Published = true AND Tags contains TAG
- `components/TagFilter.tsx`: "전체" 버튼 + 각 태그 버튼 (선택 시 파란색, 미선택 시 회색)
- 클릭 시 `/?tag=TAG_NAME` 쿼리 파라미터로 이동

**성공 기준**: ✅ 함수 구현 | 필터 작동 | 전체 초기화

---

### Phase 2.4: 홈 페이지 완성 (`app/page.tsx`)

**작업**: Server Component로 포스트 목록 페이지 구현

**구현 내용**:
- `searchParams` (tag) 처리: 쿼리 파라미터로 필터링
- `getAllPosts()` 또는 `getPostsByTag()` 호출
- 렌더링: 제목 + TagFilter + PostCard 목록 + Empty state
- `export const revalidate = 3600` (1시간 ISR)
- Tailwind: container + grid-cols-1 + py-8

**성공 기준**: ✅ 페이지 렌더링 | 필터 작동 | ISR 설정

---

### Phase 2 체크포인트 (Checkpoint 2) ✅ 완료

**검증 사항** (2026-06-21):

1. **홈 페이지 기능**
   - [x] Notion DB에서 동적 조회 (getAllPosts)
   - [x] PostCard 컴포넌트: 커버 + 제목 + 날짜 + 태그 + 요약
   - [x] TagFilter: "전체" + 각 태그 버튼, 선택 시 파란색
   - [x] 쿼리 파라미터 처리 (/?tag=TAG_NAME)
   - [x] Empty state 메시지

2. **레이아웃 & 네비게이션**
   - [x] Header: 블로그 타이틀 + 홈 링크 (sticky)
   - [x] Footer: 저작권 + 연도 동적 처리
   - [x] RootLayout 통합 (모든 페이지)
   - [x] PostCard 클릭 → /posts/[slug] 이동

3. **ISR & 성능**
   - [x] `export const revalidate = 3600` (1시간 재검증)
   - [x] 로컬 개발: 매 요청마다 fresh 데이터
   - [x] Notion 변경 → 새로고침으로 즉시 반영

**구현 파일**:
- `app/page.tsx`: Server Component, searchParams 처리
- `components/PostCard.tsx`: 카드 UI + 링크
- `components/TagFilter.tsx`: 필터 버튼 + 네비게이션
- `components/Header.tsx`: sticky header
- `components/Footer.tsx`: copyright + info

**완료**: 2026-06-21 (예상 4-5일 → 실제 2일)

---

## Phase 3: 포스트 상세 페이지 & 블록 렌더링 ✅ 완료

**목표**: Notion 블록을 HTML로 렌더링하는 포스트 상세 페이지 완성 (F002, F004, F005)

**소요 기간**: 5-6일 (예상 대비 2일 단축 - 2026-06-22 완료)

### Phase 3.1: 포스트 상세 조회 함수 구현

**작업**: Slug 기반 포스트 & 블록 조회 함수

**구현 내용**:
- `getPost(slug)`: getAllPosts()에서 slug 일치하는 포스트 검색 → NotionPost | null
- `getPageBlocksRecursive(pageId)`: 페이지의 모든 블록을 재귀적으로 조회
  - 페이지네이션 (max 100개씩)
  - has_children 속성으로 자식 블록 포함

**성공 기준**: ✅ 포스트 조회 동작 | 블록 5개+ 반환

---

### Phase 3.2: BlockRenderer 컴포넌트 개발 ✅

**작업**: Notion 블록 타입을 HTML로 변환하는 Server Component

**지원 블록 타입 (8가지)**:
- **paragraph**: rich_text + RichText 포맷팅 (bold, italic, code, link 등)
- **heading_1/2/3**: h1/h2/h3 태그 (3단계 계층)
- **code**: 코드 블록 (Shiki 강조 예정)
- **image**: 파일 또는 외부 URL
- **bulleted_list_item / numbered_list_item**: ul/ol 목록
- **quote**: blockquote (border-l-4, italic)
- **divider**: hr 태그

**RichText 헬퍼**: bold, italic, strikethrough, code, underline, link 처리

**성공 기준**: ✅ 8개 타입 모두 지원 | RichText 포맷팅 작동

---

### Phase 3.3: Shiki 통합 (코드 블록 구문 강조) ✅

**작업**: 코드 블록에 구문 강조 추가 (이미 shiki@^4.0.2 설치됨)

**구현 내용**:
- `lib/shiki-highlight.ts`: `highlightCode(code, language)` → codeToHtml() 사용
- 테마: github-light | 지원 언어: JavaScript, TypeScript, Python, Java, CSS 등
- Fallback: 지원하지 않는 언어 → 기본 텍스트로 렌더링
- BlockRenderer의 code 블록에서 사용

**성공 기준**: ✅ 코드 블록 구문 강조 | 다양한 언어 지원

---

### Phase 3.4: 포스트 상세 페이지 구현 ✅

**작업**: 동적 라우트 포스트 상세 페이지 구현

**구현 내용**:
- `app/posts/[slug]/page.tsx` (Server Component)
- **generateMetadata**: og:title, og:description, og:image (1200x630), article type
- **포스트 조회**: getPost(slug) → 없으면 notFound() 호출
- **블록 렌더링**: getPageBlocksRecursive() → BlockRenderer 맵
- **레이아웃**: 커버 이미지 + 헤더(제목, 날짜, 태그) + 본문 + 선택적 sidebar
- **ISR**: `export const revalidate = 3600` (1시간)
- **선택적**: `generateStaticParams()` (Phase 5에서 강화)

**성공 기준**: ✅ 포스트 렌더링 | OG 메타태그 | 404 처리

---

### Phase 3 체크포인트 (Checkpoint 3) ✅ 완료

**검증 사항** (2026-06-22):

1. **포스트 상세 페이지**
   - [x] getPost(slug) + getPageBlocksRecursive(pageId) 동작
   - [x] 제목 + 날짜 + 태그 표시
   - [x] 커버 이미지 표시 (있을 경우)
   - [x] 블록 렌더링 (paragraph, heading_1~3, code, image, 목록, quote, divider)
   - [x] 코드 블록: Shiki 구문 강조 (theme: github-light)
   - [x] RichText 포맷팅: bold, italic, strikethrough, code, underline, link

2. **OG 메타태그 (generateMetadata)**
   - [x] og:title = 포스트 제목
   - [x] og:description = excerpt
   - [x] og:image = 커버 이미지 (1200x630)
   - [x] og:url + article:published_time
   - [x] 페이지 소스에서 확인됨
   - [x] 소셜 공유 시뮬레이터 테스트 통과

3. **네비게이션 & ISR**
   - [x] 홈 → PostCard 클릭 → 상세
   - [x] 상세 → 헤더 타이틀 → 홈
   - [x] 상세 → 태그 클릭 → 홈 + 필터 적용 (/?tag=TAG)
   - [x] ISR: `export const revalidate = 3600`
   - [x] 존재 안 하는 slug → notFound() → 404 페이지

**구현 파일**:
- `app/posts/[slug]/page.tsx`: Server Component, generateMetadata
- `components/BlockRenderer.tsx`: 8개 블록 타입
- `lib/shiki-highlight.ts`: 코드 강조

**완료**: 2026-06-22 (예상 5-6일 → 실제 2일)

---

## Phase 4: 404 페이지 & 전역 레이아웃

**목표**: 커스텀 404 페이지 및 전역 레이아웃 최적화 (F011, F012)

**소요 기간**: 2-3일

### Phase 4.1: 커스텀 404 페이지 구현

**작업**: `app/not-found.tsx` 구현 (RootLayout 상속 안 됨)

**구현 내용**:
- 404 텍스트 + 홈으로 이동 버튼
- Header, Footer 별도 포함 필요
- 호출: `notFound()` (Phase 3.4에서), 존재하지 않는 경로, Published=false 포스트

**성공 기준**: ✅ 404 렌더링 | 홈 버튼 작동

---

### Phase 4.2: 헤더/푸터 최적화

**작업**: Header/Footer 컴포넌트 개선

**구현 내용**:
- Header: sticky positioning, 반응형, 네비 메뉴
- Footer: 저작권 연도 동적 처리, 블로거 정보, 소셜 링크
- 전역 스타일 일관성 (컬러, 폰트, 여백)

**성공 기준**: ✅ 스타일 일관성 | 모든 페이지 동일 표시

---

### Phase 4.3: 태그 필터 UI 최적화 & 통합 테스트

**작업**: 태그 필터링 통일 및 네비게이션 검증

**구현 내용**:
- TagFilter 반응형 최적화 (많은 태그 스크롤/페이지네이션)
- 포스트 상세에서 태그 클릭 → 홈으로 이동 + `/?tag=TAG` 필터 적용
- 통합 테스트: 홈 → 필터 → 상세 → 필터 → 홈 네비게이션

**성공 기준**: ✅ 필터링 일관 | 태그 네비 작동 | 모바일 UI

---

### Phase 4 체크포인트 (Checkpoint 4) ✅ 완료

**검증 사항** (2026-06-22):

1. **404 페이지**
   - [x] `app/not-found.tsx` 구현 (RootLayout 상속 X)
   - [x] 404 텍스트 + "홈으로 돌아가기" 버튼
   - [x] Header/Footer 별도 포함
   - [x] 존재 안 하는 경로 → 404 표시
   - [x] Published=false 포스트 접근 → 404

2. **전역 레이아웃 최적화**
   - [x] Header: sticky top-0, z-50, border-b
   - [x] Footer: border-t, mt-16, py-8
   - [x] RootLayout: 모든 페이지에 적용
   - [x] 컬러 스킴 일관성 (Tailwind)
   - [x] 폰트, 여백, 간격 통일

3. **네비게이션 통합 테스트**
   - [x] 홈 → PostCard 클릭 → 상세
   - [x] 상세 → 헤더 로고 → 홈
   - [x] 상세 → 태그 클릭 → 홈 (필터 적용)
   - [x] 홈 → TagFilter 클릭 → 필터 적용
   - [x] TagFilter "전체" → 필터 초기화
   - [x] 존재 안 하는 URL → 404

**완료**: 2026-06-22 (예상 2-3일 → 실제 1일)

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

**작업**: 이미지 최적화, API 캐싱, Rate Limiting 강화

**구현 내용**:
- **이미지**: Next.js Image 컴포넌트 (PostCard, 포스트 커버)
- **Notion API 캐싱**: ISR + `revalidate = 3600` (1시간)
- **Rate Limiting**: `withRetry()` 함수 + Exponential Backoff (1s, 2s, 4s)
  - 429 에러 시 최대 3회 자동 재시도
- **번들 크기**: `npm run build` 후 .next/static/ 확인
- **동적 임포트**: BlockRenderer 같은 무거운 컴포넌트 (선택적)

**성공 기준**: ✅ 이미지 최적화 | Rate Limit 대응 | 빌드 < 2분

---

### Phase 5.3: 에러 처리 & 견고성 강화

**작업**: 에러 시나리오 처리 및 로깅

**구현 내용**:
- **API 에러 핸들링**: API Key 누락 | 403 (권한) | 404 (Database ID) | 429 (Rate limit)
- **응답 검증**: Zod 스키마 검증 (선택적) - id, slug, title, publishedAt, tags 등
- **로깅**: 포스트 개수, 파싱 실패, Database 조회 실패
- **테스트 시나리오**: API Key 누락, Database ID 오류, 네트워크 오류

**성공 기준**: ✅ 에러 메시지 명확 | 로깅 기록 | 재시도 로직

---

### Phase 5.4: Vercel 배포

**작업**: Vercel에 프로젝트 배포 및 라이브 검증

**구현 내용**:
- `vercel login` → `vercel` 배포
- 환경 변수 설정: NOTION_API_KEY, NOTION_DATABASE_ID, REVALIDATE_SECRET
- 빌드 로그 확인 (에러 없음)
- 라이브 검증: 
  - **기본 기능**: 홈/상세/모든 블록/코드강조/이미지
  - **네비**: 필터/카드클릭/태그클릭/헤더/404
  - **SEO**: og:title, og:description, og:image
  - **반응형**: 모바일/태블릿/데스크톱
  - **성능**: Lighthouse > 80, 로드 < 3초 (선택적)

**성공 기준**: ✅ Vercel 배포 성공 | 모든 기능 작동 | 환경 변수 설정

---

### Phase 5.5: 최종 테스트 & 문서화

**작업**: 통합 테스트 및 배포 후 문서화

**통합 테스트 시나리오**:
1. **신규 방문자**: 홈 → 목록 → 상세 → 태그필터 → 홈
2. **콘텐츠**: 블록 타입 (텍스트, 제목, 코드, 이미지, 목록), 구문강조, 포맷팅
3. **에러**: 존재 안 하는 경로/포스트 → 404

**추가 검증**:
- 모바일 반응형 (320px, 768px, 1024px+)
- 배포 후 Notion 변경 → ISR 자동 반영 (1시간)

**선택적 문서화**:
- `DEPLOYMENT.md`: 배포 방법, 환경변수, ISR, 모니터링
- `README.md` 업데이트
- Notion 블로거 가이드

**성공 기준**: ✅ 3개 시나리오 통과 | 모바일 검증 | ISR 자동 반영

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

## 진행 상황 추적 (최신: 2026-06-22)

### 현황 요약

| Phase | 상태 | 완료일 | 예상 vs 실제 |
|-------|------|--------|-------------|
| Phase 1 | ✅ 완료 | 2026-06-21 | 4-5일 예상 → 3일 소요 (Notion API 에러 해결 추가) |
| Phase 2 | ✅ 완료 | 2026-06-21 | 4-5일 예상 → 2일 소요 |
| Phase 3 | ✅ 완료 | 2026-06-22 | 5-6일 예상 → 2일 소요 |
| Phase 4 | ✅ 완료 | 2026-06-22 | 2-3일 예상 → 1일 소요 |
| Phase 5 | ✅ 완료 | 2026-06-22 | 3-4일 예상 → 1일 소요 (배포 성공!) |

**누적 진행률**: 100% 🎉 (모든 Phase 완료)  
**배포 상태**: ✅ Vercel 라이브 배포 성공  
**배포 URL**: https://notion-cms-project-three.vercel.app/

### 주요 성과

✅ Notion API 실시간 연동 성공  
✅ 동적 포스트 목록 표시 (Notion DB에서 자동 페칭)  
✅ 태그 기반 필터링 (쿼리 파라미터 기반)  
✅ 전역 레이아웃 (헤더/푸터)  
✅ ISR 설정 (1시간 재검증)  
✅ 포스트 상세 페이지 구현  
✅ BlockRenderer 컴포넌트 (8개 블록 타입 완전 지원)  
✅ Shiki 코드 구문 강조 통합  
✅ 동적 OG 메타태그 생성 (SEO 최적화)  
✅ 소셜 공유 기능 (Twitter, Facebook)  
✅ 커스텀 404 페이지 구현  
✅ 헤더/푸터 최적화 (sticky, 반응형)  
✅ 태그 필터 UI 개선 (모바일 친화적)  
✅ **디자인 최종화** (Cream 카드, 흰색 배경, 경계선 제거)  
✅ **Vercel 라이브 배포** (https://notion-cms-project-three.vercel.app/)  
✅ **라이브 배포 검증** (홈 페이지, 포스트 상세, 태그 필터, 404 모두 정상 작동)

### 다음 단계

✅ **Phase 5: ISR, 최적화 & 배포 완료!**
- ✅ Phase 5.1: ISR 재검증 설정 (1시간 주기)
- ✅ Phase 5.2: 성능 최적화 (이미지, 캐싱)
- ✅ Phase 5.3: 에러 처리 & 견고성 강화
- ✅ Phase 5.4: Vercel 라이브 배포 성공
- ✅ Phase 5.5: 최종 테스트 & 배포 검증 완료

🚀 **MVP 완성! 블로그 라이브 서비스 중**  
📍 **배포 URL**: https://notion-cms-project-three.vercel.app/  
📝 **향후 확장**: RSS 피드, 검색 기능, 댓글, 다크 모드 등

### 추적 방법

**마지막 Git 커밋**:
```bash
Phase 1-2 Checkpoint: Notion API 연동 및 홈 페이지 완성
- 해결: Notion API v5.22.0 dataSources.query() 마이그레이션
- 해결: Client baseUrl 설정 버그 (이중 경로화)
- 해결: extractText() rich_text 타입 미지원
- 구현: 전체 포스트 목록 조회 (getAllPosts)
- 구현: 태그 필터링 (getPostsByTag)
- 구현: 홈 페이지 UI (PostCard, TagFilter)
- 확인: Notion 실시간 동기화 (개발 서버 즉시 반영)
```

**마지막 커밋 (Phase 3)**:
```bash
Phase 3 완료: 포스트 상세 페이지 및 블록 렌더링 구현
- 포스트 상세 조회 함수 (getPostBySlug, getPostBlocks)
- BlockRenderer 컴포넌트 (Notion 블록 → HTML)
- Shiki 코드 구문 강조
- 동적 OG 메타태그 (og:title, og:description, og:image, og:url, article:*)
- 소셜 공유 버튼 (Twitter, Facebook)
```

**최종 커밋 (Phase 5 완료 - 2026-06-22)**:
```bash
Phase 5 완료: Vercel 라이브 배포 & 최종 검증
- Vercel 배포 성공: https://notion-cms-project-three.vercel.app/
- 라이브 배포 검증 완료:
  ✅ 홈 페이지: 3개 포스트 Notion에서 실시간 로드
  ✅ 포스트 상세: 제목, 날짜, 태그, 본문, 공유 링크 정상 작동
  ✅ 태그 필터: /?tag=TAG 필터링 정상 작동
  ✅ 404 페이지: 존재하지 않는 경로에서 404 표시
  ✅ 레이아웃: Header/Footer 모든 페이지 일관성 유지
- ISR 설정: 1시간 주기 자동 재검증
- 스크린샷 정리: 불필요한 테스트 파일 삭제
- ROADMAP.md 최종 업데이트

MVP 최종 완성! 모든 기능 정상 작동 🎉
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

**로드맵 버전**: 1.2 (Phase 1-4 완료, Phase 5 준비)  
**작성일**: 2026-06-16  
**마지막 업데이트**: 2026-06-22  
**작성자**: Claude Code (AI Assistant)  
**관련 문서**: docs/NOTION_API_GUIDE.md, docs/PRD.md, shrimp-rules.md
