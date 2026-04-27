# Notion CMS 개인 블로그 개발 로드맵

## 개요

본 문서는 PRD.md에 정의된 Notion CMS 기반 개인 블로그 프로젝트의 개발 로드맵입니다.  
5개의 Phase로 나누어 단계별로 개발을 진행하며, 각 Phase별 예상 소요 시간과 완료 기준을 명시합니다.

**프로젝트 기간**: 약 3~4주  
**개발 담당**: Chuck Seo  
**마지막 업데이트**: 2026-04-27

---

## Phase 1: 프로젝트 초기 설정 (골격 구축)

### 개요
Notion CMS 기반 블로그의 기본 골격을 구축합니다. Next.js 프로젝트 구조를 설정하고, Notion API 연동 기반을 마련합니다.

### 왜 지금 이 단계를 하는가?
**골격이 탄탄해야 이후 기능 개발이 효율적으로 이루어집니다.**
- 프로젝트 구조가 정확하지 않으면 나중에 코드 정리와 리팩토링으로 인한 시간 낭비 발생
- Notion API 연동이 먼저 준비되어야 다른 모든 기능(글 조회, 렌더링 등)을 테스트할 수 있음
- 개발 초기 환경설정 실수는 프로젝트 전체에 영향을 미치므로 처음부터 정확하게 설정 필요

### 예상 소요 시간
**2~3일**

### 작업 항목

| 작업 | 상세 설명 | 담당자 | 상태 |
|------|---------|--------|------|
| Next.js 폴더 구조 설정 | `/lib`, `/components`, `/app`, `/types`, `/styles` 디렉토리 생성 | - | ⬜ |
| 환경 변수 설정 | `.env.local` 파일에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 등록 | - | ⬜ |
| Notion 패키지 설치 | `@notionhq/client` 패키지 설치 | - | ⬜ |
| 기본 레이아웃 구성 | `app/layout.tsx`에 Header/Footer 플레이스홀더 포함 | - | ⬜ |
| 스타일링 설정 확인 | Tailwind CSS v4, PostCSS, ESLint 설정 검증 | - | ⬜ |
| Notion API 클라이언트 초기화 | `lib/notionClient.ts` 파일에서 클라이언트 인스턴스 생성 | - | ⬜ |

### 각 작업의 이유

1. **Next.js 폴더 구조 설정**
   - 왜? 일관된 프로젝트 구조로 팀원들의 코드 가독성과 유지보수성 향상
   - 향후 컴포넌트, 유틸리티, 타입이 어디에 위치해야 하는지 명확히 함

2. **환경 변수 설정**
   - 왜? Notion API 인증이 환경 변수로 관리되어야 보안 위험 감소
   - 개발/프로덕션 환경을 다르게 설정할 수 있도록 준비

3. **Notion 패키지 설치**
   - 왜? `@notionhq/client`가 없으면 Notion API와 통신할 수 없음
   - 이후 모든 API 기능이 이 패키지에 의존

4. **기본 레이아웃 구성**
   - 왜? 모든 페이지가 공통 레이아웃(Header, Footer)을 공유하므로 먼저 준비
   - 개발 중 일관된 UI/UX 기준을 제공

5. **스타일링 설정 확인**
   - 왜? Tailwind CSS와 PostCSS가 정확히 설정되지 않으면 스타일링 작업 중 문제 발생
   - ESLint는 코드 품질 유지를 위해 필수

6. **Notion API 클라이언트 초기화**
   - 왜? 클라이언트가 준비되지 않으면 Notion 데이터를 조회할 수 없음
   - Phase 2에서 API 함수들을 작성할 수 있는 기반 제공

### 완료 기준

- ✅ `npm run dev` 실행 시 오류 없이 기본 레이아웃 페이지가 브라우저에 표시됨
- ✅ Notion API 클라이언트 초기화 코드 작성 완료 및 연결 테스트 성공
- ✅ 프로젝트 폴더 구조가 PRD 설계대로 생성됨
- ✅ 기본 `package.json`에 필요한 의존성 모두 설치됨

### 산출물

```
notion-cms-project/
├── lib/
│   └── notionClient.ts       (Notion API 클라이언트)
├── components/
│   ├── Header.tsx            (플레이스홀더)
│   └── Footer.tsx            (플레이스홀더)
├── app/
│   ├── layout.tsx            (기본 레이아웃)
│   └── page.tsx              (홈 페이지 플레이스홀더)
├── types/
│   └── index.ts              (타입 정의 파일)
├── .env.local               (환경 변수)
└── tailwind.config.ts        (이미 존재)
```

---

## Phase 2: 공통 모듈/컴포넌트 개발

### 개요
모든 기능에서 재사용될 공통 함수와 컴포넌트를 개발합니다. Notion API 공통 함수, 공통 타입, 기본 UI 컴포넌트를 작성합니다.

### 왜 지금 이 단계를 하는가?
**모든 기능에서 활용되는 코드를 먼저 정의하여 중복을 방지합니다.**
- 공통 API 함수가 없으면 각 페이지에서 중복된 Notion 데이터 조회 로직 작성 → 유지보수 어려움
- 타입 정의가 먼저 이루어져야 TypeScript 타입 검사를 활용한 안정성 향상
- Header/Footer/PostCard 같은 공통 컴포넌트를 먼저 완성하면 다른 페이지들을 빠르게 조립할 수 있음
- Phase 3에서 페이지 개발 시 이 컴포넌트와 함수들을 그대로 사용하므로 개발 속도 향상

### 예상 소요 시간
**3~4일**

### 작업 항목

| 작업 | 상세 설명 | 담당자 | 상태 |
|------|---------|--------|------|
| Notion API 공통 함수 작성 | `lib/notion.ts`: 글 목록 조회, 단일 글 조회, 카테고리 조회 함수 | - | ⬜ |
| 공통 타입 정의 | `types/index.ts`: `Post`, `Block`, `Category` 인터페이스 정의 | - | ⬜ |
| Header 컴포넌트 | `components/Header.tsx`: 로고, 사이트 제목, 네비게이션 링크 | - | ⬜ |
| Footer 컴포넌트 | `components/Footer.tsx`: 기본 푸터 (저작권, 링크 등) | - | ⬜ |
| PostCard 컴포넌트 | `components/PostCard.tsx`: 글 목록 카드 (제목, 날짜, 카테고리, excerpt) | - | ⬜ |

### 각 작업의 이유

1. **Notion API 공통 함수 작성**
   - 왜? 모든 페이지에서 글 데이터가 필요하므로 중앙집중식 함수 필요
   - 나중에 API 로직 변경 시 한 곳만 수정하면 모든 페이지에 적용 가능
   - 에러 처리, 캐싱 등을 한 번에 관리할 수 있음

2. **공통 타입 정의**
   - 왜? TypeScript를 사용하므로 타입 정의가 필수
   - 일관된 데이터 구조로 버그 감소 및 개발 안정성 향상
   - IDE의 자동완성 기능을 최대한 활용하여 개발 속도 향상

3. **Header 컴포넌트**
   - 왜? 모든 페이지의 상단에 표시되므로 먼저 준비해야 함
   - 로고와 네비게이션은 사용자가 페이지를 탐색하는 가장 중요한 요소
   - 일관된 네비게이션 구조로 사용자 경험 향상

4. **Footer 컴포넌트**
   - 왜? 모든 페이지의 하단에 표시되므로 일관성 유지 필요
   - 저작권, 링크 등 중요한 정보를 표시하는 공간

5. **PostCard 컴포넌트**
   - 왜? 글 목록 페이지에서 반복되는 컴포넌트이므로 재사용성 중요
   - 나중에 카드 스타일을 변경할 때 한 곳만 수정하면 모든 글 목록에 적용 가능
   - 다른 페이지(검색 결과, 카테고리 필터 등)에서도 동일하게 사용 가능

### Notion API 공통 함수 상세

```typescript
// lib/notion.ts
- getPosts(limit?: number, offset?: number): Promise<Post[]>
  (Notion 데이터베이스에서 발행된 글 목록 조회)

- getPostBySlug(slug: string): Promise<Post>
  (slug 기반으로 단일 글 조회)

- getCategories(): Promise<Category[]>
  (전체 카테고리 목록 조회)

- getPostsByCategory(category: string): Promise<Post[]>
  (특정 카테고리의 글 목록 조회)
```

### 공통 타입 정의

```typescript
// types/index.ts
interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  publishedDate: Date;
  modifiedDate: Date;
  status: 'draft' | 'published';
  content: Block[];
  excerpt: string;
}

interface Block {
  id: string;
  type: string; // 'paragraph', 'heading1', 'image', 'code', etc.
  content: any;
  metadata?: Record<string, any>;
}

interface Category {
  name: string;
  count: number;
}
```

### 완료 기준

- ✅ Notion API 함수가 실제 Notion 데이터베이스에서 정상적으로 데이터를 반환함
- ✅ Header, Footer, PostCard 컴포넌트가 각각 독립적으로 렌더링됨 (Storybook 또는 테스트 페이지)
- ✅ TypeScript `tsc --noEmit` 명령어 실행 시 타입 오류 없음
- ✅ 공통 함수와 컴포넌트가 다른 파일에서 정상적으로 import 가능함

### 산출물

```
notion-cms-project/
├── lib/
│   ├── notionClient.ts
│   └── notion.ts                     (✨ 새로 작성)
├── components/
│   ├── Header.tsx                    (✨ 수정)
│   ├── Footer.tsx                    (✨ 수정)
│   └── PostCard.tsx                  (✨ 새로 작성)
└── types/
    └── index.ts                      (✨ 새로 작성)
```

---

## Phase 3: 핵심기능 개발

### 개요
블로그의 핵심 기능인 글 목록 페이지와 글 상세 페이지를 개발합니다. Notion 콘텐츠를 웹 페이지에 렌더링하는 기능을 구현합니다.

### 왜 지금 이 단계를 하는가?
**블로그의 가장 기본이 되는 기능이므로 먼저 개발해야 합니다.**
- 글을 읽고 보는 기능 없이는 블로그로서의 역할을 할 수 없음
- MVP(Minimum Viable Product) 완성을 위해 가장 기본적인 기능 우선 개발
- Phase 1과 2에서 준비한 골격과 공통 컴포넌트를 활용하여 빠르게 개발 가능
- 글 목록과 상세 페이지의 동작을 먼저 검증하고, 이를 바탕으로 Phase 4의 추가기능 개발

### 예상 소요 시간
**5~7일**

### 작업 항목

| 작업 | 상세 설명 | 담당자 | 상태 |
|------|---------|--------|------|
| 글 목록 페이지 | `app/page.tsx`: 홈 페이지에서 글 목록 표시 및 페이지네이션 | - | ⬜ |
| 글 상세 페이지 | `app/posts/[slug]/page.tsx`: 동적 라우팅으로 개별 글 상세 표시 | - | ⬜ |
| Notion 블록 렌더러 | `components/NotionRenderer.tsx`: paragraph, heading, image, code, quote, list 렌더링 | - | ⬜ |
| 이전/다음 글 네비게이션 | `components/PostNavigation.tsx`: 글 상세 페이지에서 이전/다음 글 링크 | - | ⬜ |
| 로딩/에러 상태 처리 | `app/posts/[slug]/loading.tsx`, `app/posts/[slug]/error.tsx` | - | ⬜ |

### 각 작업의 이유

1. **글 목록 페이지**
   - 왜? 사용자가 블로그에 접속했을 때 가장 먼저 보는 페이지
   - Notion 데이터베이스에서 글을 성공적으로 조회하고 표시하는 첫 번째 검증
   - 페이지네이션으로 많은 글을 효율적으로 표시하는 방법 구현

2. **글 상세 페이지**
   - 왜? 사용자가 글을 읽는 핵심 페이지
   - 동적 라우팅(`[slug]`)을 통해 Next.js의 핵심 기능 활용
   - 각 글의 전체 내용을 정확하게 렌더링하는 방법 검증

3. **Notion 블록 렌더러**
   - 왜? Notion의 블록을 웹 페이지로 변환하는 핵심 기능
   - 텍스트, 이미지, 코드, 인용문 등 다양한 콘텐츠 타입 지원
   - 블록 렌더링이 정확하지 않으면 글 내용이 제대로 표시되지 않음

4. **이전/다음 글 네비게이션**
   - 왜? 사용자가 글 간에 쉽게 이동할 수 있게 함
   - 블로그의 페이지뷰와 체류 시간 증대
   - 사용자 경험 향상

5. **로딩/에러 상태 처리**
   - 왜? 실제 환경에서 API 요청이 실패하거나 늦을 수 있음
   - 사용자에게 적절한 피드백 제공 (로딩 중, 에러 발생 등)
   - 안정성 있는 사용자 경험 제공

### 글 목록 페이지 (`app/page.tsx`)

**기능**:
- Notion 데이터베이스에서 발행된 글을 최신순으로 조회
- 10개씩 페이지네이션 또는 무한 스크롤
- 각 글은 PostCard 컴포넌트로 표시
- 로딩/에러 상태 처리

**예상 UI**:
```
┌─────────────────────────────┐
│      Header                 │
├─────────────────────────────┤
│  글1 (PostCard)             │
├─────────────────────────────┤
│  글2 (PostCard)             │
├─────────────────────────────┤
│  ... (총 10개)              │
├─────────────────────────────┤
│  페이지네이션               │
├─────────────────────────────┤
│      Footer                 │
└─────────────────────────────┘
```

### 글 상세 페이지 (`app/posts/[slug]/page.tsx`)

**기능**:
- slug 기반으로 글 조회
- 글의 전체 본문 (Notion 블록)을 렌더링
- 제목, 작성일, 수정일, 카테고리, 태그 표시
- 이전/다음 글 네비게이션
- 메타데이터 (title, description) 설정

**예상 UI**:
```
┌─────────────────────────────┐
│      Header                 │
├─────────────────────────────┤
│  글 제목                     │
│  메타정보 (날짜, 카테고리)   │
├─────────────────────────────┤
│  글 본문                     │
│  - 텍스트, 이미지, 코드 등   │
├─────────────────────────────┤
│  태그                        │
├─────────────────────────────┤
│  이전/다음 글 네비게이션     │
├─────────────────────────────┤
│      Footer                 │
└─────────────────────────────┘
```

### Notion 블록 렌더러 (`components/NotionRenderer.tsx`)

**지원 블록 타입**:
- `paragraph`: 일반 텍스트 단락
- `heading1`, `heading2`, `heading3`: 제목
- `image`: 이미지 (alt 텍스트 포함)
- `code`: 코드 블록 (syntax highlighting)
- `quote`: 인용문
- `bulleted_list_item`: 글머리 목록
- `numbered_list_item`: 번호 매김 목록
- `divider`: 구분선

### 완료 기준

- ✅ 홈 페이지(`/`)에서 Notion 글 목록이 최신순으로 올바르게 표시됨
- ✅ 글 카드를 클릭하면 `/posts/[slug]`로 라우팅되고 전체 본문이 렌더링됨
- ✅ Notion의 코드 블록, 이미지, 텍스트가 올바르게 웹 페이지에 표시됨
- ✅ 이전/다음 글 네비게이션이 정상 작동함
- ✅ 페이지네이션이 정상 작동함 (또는 무한 스크롤)
- ✅ 에러 상황 발생 시 에러 페이지가 표시됨

### 산출물

```
notion-cms-project/
├── components/
│   ├── NotionRenderer.tsx             (✨ 새로 작성)
│   └── PostNavigation.tsx             (✨ 새로 작성)
├── app/
│   ├── page.tsx                       (✨ 수정)
│   └── posts/
│       └── [slug]/
│           ├── page.tsx               (✨ 새로 작성)
│           ├── loading.tsx            (✨ 새로 작성)
│           └── error.tsx              (✨ 새로 작성)
```

---

## Phase 4: 추가기능 개발

### 개요
SEO 최적화, 카테고리 필터링, 검색 기능 등 추가 기능을 개발합니다. 사용자 경험을 향상시키는 기능들을 구현합니다.

### 왜 지금 이 단계를 하는가?
**핵심기능이 완성된 이후에 추가기능을 개발하면 통합이 용이합니다.**
- Phase 3에서 글 목록과 상세 페이지가 완성되어야 카테고리 필터링과 검색의 테스트 가능
- 핵심 기능이 안정화된 후에 추가 기능을 덧붙이면 예기치 않은 버그 감소
- SEO 메타태그는 실제 콘텐츠가 존재한 후에 자동 생성하는 것이 의미 있음
- 사용자가 쉽게 글을 찾을 수 있도록 하여 블로그의 완성도 향상

### 예상 소요 시간
**4~5일**

### 작업 항목

| 작업 | 상세 설명 | 담당자 | 상태 |
|------|---------|--------|------|
| 카테고리 페이지 | `app/category/[category]/page.tsx`: 카테고리별 글 필터링 | - | ⬜ |
| 카테고리 필터 UI | `components/CategoryFilter.tsx`: 카테고리 선택 버튼/태그 | - | ⬜ |
| SEO 최적화 | `lib/seo.ts`: 각 페이지의 메타태그 자동 생성 (`title`, `og:title`, `og:description` 등) | - | ⬜ |
| 검색 기능 | `components/SearchBar.tsx`: 키워드 검색 입력 및 결과 표시 | - | ⬜ |
| 검색 결과 페이지 | `app/search/page.tsx`: 검색어 기반 글 목록 표시 | - | ⬜ |

### 각 작업의 이유

1. **카테고리 페이지**
   - 왜? 사용자가 특정 주제의 글만 집중해서 볼 수 있게 함
   - 블로그의 구조화된 탐색 제공 → 사용자 만족도 향상
   - 글이 많아질수록 카테고리 필터링의 중요성 증가

2. **카테고리 필터 UI**
   - 왜? 사용자가 카테고리를 쉽게 선택할 수 있는 인터페이스 필요
   - 글 목록 페이지에서 실시간으로 필터링하는 기능 제공
   - 시각적 피드백(활성화된 카테고리 표시)으로 UX 향상

3. **SEO 최적화**
   - 왜? 검색 엔진에서 블로그를 찾을 수 있도록 메타데이터 필수
   - SNS(Facebook, Twitter) 공유 시 미리보기 제공
   - Google 검색 결과에서 적절한 제목과 설명 표시
   - 핵심 기능이 완성된 후에 적용해야 모든 페이지에 일관되게 적용 가능

4. **검색 기능**
   - 왜? 글이 많아질 때 사용자가 원하는 글을 빠르게 찾을 수 있게 함
   - 직관적인 검색 인터페이스로 사용자 경험 향상
   - 제목과 태그 기반 검색으로 높은 정확도

5. **검색 결과 페이지**
   - 왜? 검색 결과를 명확하고 체계적으로 표시하기 위함
   - 결과 없음, 검색 오류 등에 대한 적절한 피드백 제공
   - 사용자가 검색한 키워드를 다시 활용하여 추가 검색 용이

### 카테고리 페이지 (`app/category/[category]/page.tsx`)

**기능**:
- URL 파라미터에서 카테고리명 추출
- 해당 카테고리의 글만 필터링하여 표시
- 홈 페이지와 동일한 레이아웃 구조
- 선택된 카테고리명을 제목에 표시

**예상 UI**:
```
┌─────────────────────────────┐
│      Header                 │
├─────────────────────────────┤
│  [카테고리명] 글 목록       │
├─────────────────────────────┤
│  카테고리 필터 (활성화)      │
├─────────────────────────────┤
│  글 목록 (필터된 글)        │
│ ┌──────────────────────────┐│
│ │ 글1 (해당 카테고리)      ││
│ ├──────────────────────────┤│
│ │ 글2 (해당 카테고리)      ││
│ └──────────────────────────┘│
├─────────────────────────────┤
│  페이지네이션               │
├─────────────────────────────┤
│      Footer                 │
└─────────────────────────────┘
```

### 검색 기능 (`components/SearchBar.tsx`)

**기능**:
- 페이지 상단에 검색 입력란 표시
- 글 제목, 태그를 기준으로 검색
- 검색 결과 없음 메시지 표시
- 검색 결과를 별도 페이지에서 표시

**검색 로직**:
```typescript
// 검색 기준
- 글 제목 (title) 포함 여부
- 글 태그 (tags) 포함 여부
- 카테고리 (category) 포함 여부

// 결과 정렬
- 검색 일치도 순
- 최신 글 순
```

### SEO 최적화 (`lib/seo.ts`)

**메타태그 자동 생성**:
- `<title>`: 글 제목 또는 사이트 제목
- `<meta name="description">`: 글 excerpt 또는 사이트 설명
- `<meta property="og:title">`: Open Graph 제목
- `<meta property="og:description">`: Open Graph 설명
- `<meta property="og:image">`: Open Graph 이미지 (글 첫 이미지)
- `<meta name="twitter:card">`: Twitter 카드 타입

**구현 방식**:
```typescript
// app/posts/[slug]/page.tsx
export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      // ...
    },
  };
}
```

### 완료 기준

- ✅ 카테고리 클릭 시 `/category/[category]`로 이동하고 해당 카테고리의 글만 필터링되어 표시됨
- ✅ 각 페이지의 메타태그(`<title>`, `og:title`, `og:description`)가 동적으로 생성됨
- ✅ 검색 입력란에 키워드를 입력하면 관련 글 목록이 표시됨
- ✅ 검색 결과 없음 상황에서 안내 메시지가 표시됨
- ✅ SEO 메타태그가 SNS(Facebook, Twitter) 공유 시 올바르게 표시됨

### 산출물

```
notion-cms-project/
├── lib/
│   └── seo.ts                        (✨ 새로 작성)
├── components/
│   ├── CategoryFilter.tsx            (✨ 새로 작성)
│   └── SearchBar.tsx                 (✨ 새로 작성)
├── app/
│   ├── category/
│   │   └── [category]/
│   │       └── page.tsx              (✨ 새로 작성)
│   └── search/
│       └── page.tsx                  (✨ 새로 작성)
```

---

## Phase 5: 최적화 및 배포

### 개요
성능 최적화, 반응형 디자인 개선, Vercel 배포를 진행합니다. 최종 QA를 수행하고 프로덕션 환경에 배포합니다.

### 왜 지금 이 단계를 하는가?
**주요 기능이 모두 개발된 후에 품질 향상을 도모합니다.**
- 기능을 계속 추가하면서 최적화하면 다시 수정해야 할 수 있음 → 비효율적
- 모든 컴포넌트가 완성된 후에 번들 크기, 이미지 최적화 등을 한 번에 적용하는 것이 효율적
- 반응형 디자인은 모든 페이지가 완성된 후에 최종 검토하는 것이 정확함
- 배포 전 최종 QA로 프로덕션 환경에서의 예기치 않은 버그 사전 방지

### 예상 소요 시간
**3~4일**

### 작업 항목

| 작업 | 상세 설명 | 담당자 | 상태 |
|------|---------|--------|------|
| ISR 설정 | 글 목록, 상세 페이지에 ISR(Incremental Static Regeneration) 적용 (60초 주기) | - | ⬜ |
| 이미지 최적화 | Next.js `Image` 컴포넌트 사용, WebP 형식 지원, 지연 로딩 | - | ⬜ |
| 반응형 디자인 최종 검토 | 모바일(320px), 태블릿(768px), 데스크톱(1024px) 레이아웃 검증 | - | ⬜ |
| Lighthouse 점수 개선 | 성능(Performance) 90점 이상 달성 | - | ⬜ |
| Vercel 배포 | Vercel 프로젝트 설정, 환경 변수 등록, 배포 | - | ⬜ |
| 최종 QA 및 테스트 | 기능 테스트, 브라우저 호환성 테스트, 성능 테스트 | - | ⬜ |

### 각 작업의 이유

1. **ISR 설정**
   - 왜? Notion 데이터가 변경될 때 블로그도 자동으로 최신 콘텐츠를 반영해야 함
   - 60초 주기로 재생성하면 Notion 업데이트와 블로그 반영 간 지연 최소화
   - 정적 생성의 빠른 성능 + 동적 업데이트의 유연성 결합

2. **이미지 최적화**
   - 왜? 이미지는 페이지 로딩 시간의 큰 부분을 차지
   - Next.js `Image` 컴포넌트로 자동 리사이징, WebP 제공, 지연 로딩
   - 성능 개선과 사용자 경험 향상 동시 달성

3. **반응형 디자인 최종 검토**
   - 왜? 모바일 사용자가 전체 트래픽의 절반 이상을 차지하는 시대
   - 모든 디바이스에서 동일한 품질의 경험 제공이 필수
   - 모든 페이지가 완성된 후에야 전체 사이트의 반응형 동작 검증 가능

4. **Lighthouse 점수 개선**
   - 왜? Google의 SEO 순위 결정에 핵심 요소
   - 90점 이상은 프로덕션 서비스의 표준 수준
   - 성능, 접근성, SEO 등 모든 영역에서 품질 확보

5. **Vercel 배포**
   - 왜? 로컬 개발 환경만으로는 실제 프로덕션 환경의 문제 발견 불가
   - Vercel은 Next.js 최적화 배포 플랫폼으로 성능 극대화
   - 전 세계 CDN을 통한 빠른 콘텐츠 전달

6. **최종 QA 및 테스트**
   - 왜? 배포 전 마지막 검증으로 심각한 버그 사전 방지
   - 개발 환경과 프로덕션 환경의 차이로 인한 문제 발견
   - 사용자가 안정적인 서비스를 이용할 수 있도록 보장

### ISR 설정 (`app/page.tsx`, `app/posts/[slug]/page.tsx`)

**설정 예시**:
```typescript
// app/page.tsx
export const revalidate = 60; // 60초마다 재생성

// app/posts/[slug]/page.tsx
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}
```

### 이미지 최적화

**방식**:
- Notion 이미지를 Next.js `Image` 컴포넌트로 래핑
- `priority`, `fill`, `sizes` 속성 설정
- WebP 형식 자동 제공
- 지연 로딩(Lazy Loading) 활용

```typescript
<Image
  src={imageUrl}
  alt={caption}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1024px"
  priority={false}
/>
```

### 반응형 디자인 검증

**테스트 항목**:
- 모바일(320px 이상): 한 칼럼, 터치 친화적
- 태블릿(768px 이상): 적절한 여백, 가독성
- 데스크톱(1024px 이상): 멀티 칼럼, 최적화된 레이아웃
- 모든 화면에서 텍스트 가독성 확인
- 이미지 비율 유지 확인

### Lighthouse 성능 최적화

**목표**:
- 성능(Performance): 90점 이상
- 접근성(Accessibility): 90점 이상
- 권장사항(Best Practices): 90점 이상
- SEO: 90점 이상

**최적화 항목**:
- 번들 크기 최소화 (코드 분할)
- 미사용 CSS 제거
- 폰트 최적화 (font-display: swap)
- Third-party 스크립트 최적화

### Vercel 배포

**배포 단계**:
1. Vercel 계정 및 프로젝트 생성
2. GitHub 연동 (자동 배포 설정)
3. 환경 변수 등록 (NOTION_API_KEY, NOTION_DATABASE_ID)
4. 배포 및 URL 확인
5. 프로덕션 환경에서 기능 테스트

**배포 URL**: `https://<project-name>.vercel.app`

### 최종 QA 체크리스트

#### 기능 테스트
- ✅ 홈 페이지에서 글 목록이 올바르게 표시됨
- ✅ 글 클릭 시 상세 페이지로 이동하고 본문이 올바르게 렌더링됨
- ✅ 카테고리 필터링이 정상 작동함
- ✅ 검색 기능이 정상 작동함
- ✅ 이전/다음 글 네비게이션이 정상 작동함
- ✅ 페이지네이션이 정상 작동함

#### 브라우저 호환성 테스트
- ✅ Chrome (최신 버전)
- ✅ Firefox (최신 버전)
- ✅ Safari (최신 버전)
- ✅ Edge (최신 버전)
- ✅ 모바일 Safari (iOS)
- ✅ Chrome Mobile (Android)

#### 성능 테스트
- ✅ Lighthouse 점수 90점 이상
- ✅ 페이지 로딩 시간 3초 이내
- ✅ First Contentful Paint (FCP) 1.5초 이내
- ✅ Cumulative Layout Shift (CLS) 0.1 이하

#### SEO 및 메타데이터 테스트
- ✅ 각 페이지의 `<title>` 태그가 올바르게 설정됨
- ✅ 메타 설명(description)이 올바르게 표시됨
- ✅ Open Graph 메타태그가 SNS 공유 시 올바르게 표시됨
- ✅ Sitemap이 생성되고 접근 가능함

### 완료 기준

- ✅ Lighthouse 성능 점수 90점 이상 달성
- ✅ 모바일/태블릿/데스크톱에서 레이아웃이 완벽하게 표시되고 깨짐 없음
- ✅ Vercel 프로덕션 URL에서 모든 기능이 정상 작동함
- ✅ 페이지 로딩 시간 3초 이내 확인됨
- ✅ 모든 브라우저에서 호환성 문제 없음
- ✅ 최종 QA 체크리스트 100% 완료

### 산출물

```
notion-cms-project/ (최종 완성)
├── app/
│   ├── page.tsx                      (ISR 설정 추가)
│   ├── posts/[slug]/page.tsx         (ISR 설정 추가)
│   └── ... (모든 페이지 최적화)
├── components/
│   └── ... (이미지 최적화 등)
├── vercel.json                       (✨ 새로 작성 - 배포 설정)
└── ... (최적화 완료)
```

---

## 개발 일정 요약

| Phase | 항목 | 예상 기간 | 시작 | 완료 |
|-------|------|---------|------|------|
| 1 | 프로젝트 초기 설정 | 2~3일 | TBD | TBD |
| 2 | 공통 모듈/컴포넌트 개발 | 3~4일 | TBD | TBD |
| 3 | 핵심기능 개발 | 5~7일 | TBD | TBD |
| 4 | 추가기능 개발 | 4~5일 | TBD | TBD |
| 5 | 최적화 및 배포 | 3~4일 | TBD | TBD |
| **총 소요 기간** | **17~23일 (약 3~4주)** | | |

---

## 성공 기준 (최종 목표)

1. **기능 완성도**
   - Notion 데이터베이스 연동 성공
   - 글 목록, 상세, 카테고리별 필터링, 검색 기능 완전히 작동

2. **성능 요구사항**
   - 페이지 로딩 시간: 3초 이내
   - Lighthouse 성능 점수: 90점 이상
   - First Contentful Paint (FCP): 1.5초 이내

3. **반응형 디자인**
   - 모바일(320px+), 태블릿(768px+), 데스크톱(1024px+) 모두 완벽 지원

4. **SEO 최적화**
   - 메타 태그 자동 생성
   - Open Graph 태그 지원
   - Sitemap 생성

5. **배포**
   - Vercel에 성공적으로 배포
   - 프로덕션 환경에서 모든 기능 정상 작동

---

## 참고사항

### Notion API 제한사항
- API 속도 제한: 3 req/sec
- 데이터베이스 쿼리: 100개 항목씩만 가능 (pagination 필수)
- 블록 콘텐츠: 별도 요청으로 조회

### 환경 변수 설정 (`.env.local`)
```bash
NOTION_API_KEY=your_api_key_here
NOTION_DATABASE_ID=your_database_id_here
```

### 유용한 리소스
- [Notion API 공식 문서](https://developers.notion.com)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)

---

**문서 작성**: 2026-04-27  
**담당자**: Chuck Seo  
**상태**: 개발 준비 중
