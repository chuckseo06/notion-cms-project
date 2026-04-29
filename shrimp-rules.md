# Notion CMS 개인 블로그 - AI 개발 규칙

> **이 문서는 AI 에이전트를 위한 개발 규칙입니다.**  
> 프로젝트별 구체적 규칙과 제약사항을 명시하며, AI가 자동으로 이해하고 적용해야 합니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Notion CMS 기반 개인 블로그 |
| **목표** | Notion 데이터베이스의 글을 자동으로 웹 블로그에 표시하는 시스템 구축 |
| **기술 스택** | Next.js 16.2.2, React 19.2.4, TypeScript 5.x, Tailwind CSS v4, shadcn/ui |
| **개발 기간** | 약 3~4주 (5개 Phase, 17~23일 소요) |
| **현재 단계** | Phase 1 (프로젝트 초기 설정) |
| **개발 순서** | Phase 1 → 2 → 3 → 4 → 5 (절대 변경 금지) |

---

## 2. 프로젝트 아키텍처

### 최종 폴더 구조 (Phase 1 완료 후)

```
notion-cms-project/
├── app/                           # Next.js App Router (동적 라우팅)
│   ├── layout.tsx                # 공통 레이아웃 (Header, Footer)
│   ├── page.tsx                  # 홈 페이지 (글 목록)
│   ├── posts/
│   │   └── [slug]/               # 동적 라우팅: 글 상세
│   │       ├── page.tsx
│   │       ├── loading.tsx       # 로딩 상태
│   │       └── error.tsx         # 에러 상태
│   ├── category/
│   │   └── [category]/           # 동적 라우팅: 카테고리
│   │       └── page.tsx
│   └── search/
│       └── page.tsx              # 검색 결과
├── components/                    # React UI 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PostCard.tsx
│   ├── NotionRenderer.tsx        # Notion 블록 렌더러
│   ├── PostNavigation.tsx        # 이전/다음 글
│   ├── CategoryFilter.tsx        # 카테고리 필터
│   └── SearchBar.tsx
├── lib/                           # 유틸리티 & API 함수
│   ├── notionClient.ts           # Notion API 클라이언트 (초기화만)
│   ├── notion.ts                 # 공통 API 함수 (모든 Notion 호출)
│   └── seo.ts                    # SEO 메타데이터 생성
├── types/                         # TypeScript 타입 정의
│   └── index.ts                  # 모든 인터페이스
├── styles/
│   └── globals.css               # 글로벌 스타일
├── public/                        # 정적 파일
├── .env.local                     # 환경 변수 (git ignore)
├── CLAUDE.md                      # 프로젝트 지시사항
├── AGENTS.md                      # 프레임워크 주의사항
├── docs/
│   ├── PRD.md                    # 기획 문서
│   └── ROADMAP.md                # 개발 로드맵
└── tailwind.config.ts             # 이미 존재
```

### 주요 디렉토리 설명

| 디렉토리 | 목적 | 비고 |
|---------|------|------|
| `app/` | Next.js 페이지 및 동적 라우팅 | App Router 패턴 |
| `components/` | 재사용 가능한 React 컴포넌트 | PascalCase 네이밍 |
| `lib/` | 유틸리티, API 함수, 헬퍼 | camelCase 네이밍 |
| `types/` | TypeScript 인터페이스 정의 | 중앙집중식 관리 |

---

## 3. 코드 기준

### 3.1 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| **파일명** | kebab-case | `post-card.tsx`, `notion-client.ts` |
| **컴포넌트명** | PascalCase | `Header`, `PostCard`, `NotionRenderer` |
| **함수명** | camelCase | `getPosts`, `getPostBySlug`, `renderBlock` |
| **상수명** | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `API_TIMEOUT` |
| **타입/인터페이스** | PascalCase | `Post`, `Block`, `Category` |
| **변수명** | camelCase | `postTitle`, `categoryList`, `isLoading` |
| **URL 파라미터** | kebab-case | `/posts/[slug]`, `/category/[category]` |

**⚠️ 절대 금지:**
- ❌ 한국어 변수/함수명 (예: `글_제목`, `글목록_가져오기`)
- ❌ snake_case for 변수명 (예: `post_title`)
- ❌ 혼합 패턴 (예: `Post_Card`, `getPostTitle`)

### 3.2 포맷팅 규칙

| 항목 | 규칙 |
|------|------|
| **들여쓰기** | 2칸 (스페이스) |
| **세미콜론** | 필수 (ESLint 설정) |
| **따옴표** | 더블 쿼트 `"` |
| **함수 형식** | 화살표 함수 (arrow function) |
| **주석** | 한국어, 한 줄만, WHY가 명확할 때만 |
| **빈 줄** | 로직 단위마다 구분 |

**컴포넌트 구조 예시:**
```typescript
// components/PostCard.tsx
interface PostCardProps {
  post: Post;
  onClickTitle?: (slug: string) => void;
}

export default function PostCard({ post, onClickTitle }: PostCardProps) {
  const handleClick = () => {
    onClickTitle?.(post.slug);
  };

  return (
    <div className="...">
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

---

## 4. 기능 구현 기준

### 4.1 Notion API 통합 규칙

**⚠️ 모든 Notion API 호출은 `lib/notion.ts`에서만 수행**

| 파일 | 역할 | 변경 금지 |
|------|------|---------|
| `lib/notionClient.ts` | Notion API 클라이언트 초기화만 | ✓ 함수 추가 금지 |
| `lib/notion.ts` | 모든 공통 API 함수 정의 | ✗ 이곳에서만 수정 |
| `app/*.tsx` | notion.ts에서 함수만 import | ✓ 직접 호출 금지 |

**필수 API 함수 (lib/notion.ts에 구현):**
```typescript
- getPosts(limit?: number, offset?: number): Promise<Post[]>
- getPostBySlug(slug: string): Promise<Post>
- getCategories(): Promise<Category[]>
- getPostsByCategory(category: string): Promise<Post[]>
```

**에러 처리 패턴:**
```typescript
async function getPosts(limit = 10, offset = 0) {
  try {
    // API 호출
    return posts;
  } catch (error) {
    console.error("글 목록 조회 실패:", error);
    throw new Error("글을 불러올 수 없습니다.");
  }
}
```

### 4.2 타입 정의 규칙

**⚠️ 모든 타입은 `types/index.ts`에서만 정의**

**필수 타입:**
```typescript
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
  type: string; // 'paragraph', 'heading1', 'image', 'code', 'quote', etc.
  content: any;
  metadata?: Record<string, any>;
}

interface Category {
  name: string;
  count: number;
}
```

**타입 작성 규칙:**
- ❌ `any` 타입 절대 금지
- ✓ 명확한 타입 명시 (string, number, Date, etc.)
- ✓ 선택적 필드는 `?` 사용
- ✓ 필수 필드를 먼저, 선택적 필드를 나중에 배치

### 4.3 컴포넌트 작성 규칙

**필수 규칙:**
- ✓ 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
- ✓ React Hooks 사용 (useState, useEffect, useMemo)
- ✓ Props는 인터페이스로 정의
- ✓ 기본값 내보내기: `export default function ComponentName() {}`

**Props 인터페이스 규칙:**
```typescript
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  callback?: (value: string) => void;
}
```

### 4.4 페이지 구현 규칙

**동적 라우팅:**
- `[slug]`, `[category]` 등 대괄호 사용
- generateStaticParams() 함수로 정적 경로 생성 (ISR)
- loading.tsx, error.tsx로 상태 분리

**메타데이터 (SEO):**
```typescript
export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

**ISR 설정:**
```typescript
export const revalidate = 60; // 60초마다 재생성
```

---

## 5. 프레임워크 & 라이브러리 사용 기준

| 프레임워크 | 버전 | 사용 규칙 |
|----------|------|---------|
| **Next.js** | 16.2.2 | App Router (Pages Router 금지) |
| **React** | 19.2.4 | Hooks만 사용 |
| **TypeScript** | ^5 | strict mode 필수 |
| **Tailwind CSS** | v4 | 유틸리티 클래스만 사용 |
| **shadcn/ui** | 4.1.2 | 필요시 컴포넌트 추가 |
| **Notion Client** | @notionhq/client | lib/notion.ts에서만 사용 |

**라이브러리 추가 규칙:**
- ❌ 임의로 라이브러리 추가 금지
- ✓ Phase 완료 후 필요시만 추가
- ✓ package.json 수정 후 npm install
- ✓ 커밋 메시지에 라이브러리 추가 명시

---

## 6. 워크플로우 기준

### 6.1 Phase별 구현 순서 (절대 변경 금지)

```
Phase 1: 프로젝트 초기 설정 (2~3일)
  ↓ (Phase 1 완료 기준 충족 후)
Phase 2: 공통 모듈/컴포넌트 개발 (3~4일)
  ↓ (Phase 2 완료 기준 충족 후)
Phase 3: 핵심기능 개발 (5~7일)
  ↓ (Phase 3 완료 기준 충족 후)
Phase 4: 추가기능 개발 (4~5일)
  ↓ (Phase 4 완료 기준 충족 후)
Phase 5: 최적화 및 배포 (3~4일)
```

**⚠️ Phase 순서 무시 금지:**
- ❌ Phase 1을 건너뛰고 Phase 3부터 시작
- ❌ Phase 2를 부분적으로만 진행하고 Phase 3 진행
- ✓ 각 Phase의 완료 기준을 모두 충족 후 다음 Phase

### 6.2 각 Phase별 산출물

**Phase 1 완료:**
- 폴더 구조 생성 완료
- Notion API 클라이언트 초기화 완료
- 기본 레이아웃 (Header, Footer) 플레이스홀더 완료

**Phase 2 완료:**
- Notion API 공통 함수 (getPosts, getPostBySlug, etc.)
- 공통 컴포넌트 (Header, Footer, PostCard)
- 공통 타입 정의 (Post, Block, Category)

**Phase 3 완료:**
- 글 목록 페이지 (/)
- 글 상세 페이지 (/posts/[slug])
- Notion 블록 렌더러

**Phase 4 완료:**
- 카테고리 페이지 (/category/[category])
- 검색 페이지 (/search)
- SEO 메타데이터

**Phase 5 완료:**
- ISR 설정 완료
- Lighthouse 90점 이상
- Vercel 배포 완료

### 6.3 커밋 메시지 규칙

**형식:**
```
[Phase N] 기능명: 상세 설명

[Phase 1] 초기 설정: 프로젝트 폴더 구조 생성
[Phase 2] 공통 함수: getPosts, getPostBySlug 구현
[Phase 3] 글 상세: Notion 블록 렌더러 구현
```

**규칙:**
- ✓ 한국어 작성
- ✓ Phase 번호 명시 ([Phase N])
- ✓ 첫 줄 50자 이내
- ✓ 영어 함수/파일명은 그대로 유지

---

## 7. 핵심 파일 상호작용

### 파일 의존성 맵

```
types/index.ts
  ↑ (모든 파일이 참조)
  ├── lib/notion.ts
  ├── lib/notionClient.ts
  ├── components/*.tsx
  └── app/*.tsx

lib/notionClient.ts
  ↑ (lib/notion.ts에서만 참조)
  └── lib/notion.ts

lib/notion.ts
  ↑ (app/page.tsx, app/posts/[slug]/page.tsx 등에서 참조)
  └── app/*.tsx

components/*.tsx
  ↑ (app/*.tsx에서 import)
  └── app/*.tsx
```

### 다중 파일 수정 규칙

**새로운 페이지 추가 시:**
1. `app/[route]/page.tsx` 생성
2. `types/index.ts`에서 필요한 타입 확인
3. `lib/notion.ts`에서 필요한 함수 확인
4. 없으면 함수 추가

**예: 태그 페이지 추가**
```
app/tags/[tag]/page.tsx (신규 생성)
  → types/index.ts (Post 타입 이미 있음, 확인만)
  → lib/notion.ts (getPostsByTag 함수 추가 필요)
```

**새로운 컴포넌트 추가 시:**
1. `components/ComponentName.tsx` 생성
2. Props 인터페이스 정의 (또는 types/index.ts 참조)
3. 필요한 곳에서 import

**API 함수 추가 시:**
1. `lib/notion.ts`에만 추가
2. 함수 타입 명시
3. 에러 처리 포함

**타입 추가 시:**
1. `types/index.ts`에만 추가
2. 필드 순서: 필수 → 선택적
3. 다른 파일에서 영향 검토

---

## 8. AI 의사결정 규칙

### 새로운 기능 추가 요청 시 체크리스트

```
1. 현재 Phase 확인
   ├─ 요청이 현재 Phase 범위 내인가?
   └─ 아니면 다음 Phase인가?

2. 필요한 파일 확인
   ├─ 타입이 types/index.ts에 정의되어 있는가?
   ├─ API 함수가 lib/notion.ts에 있는가?
   └─ 컴포넌트가 필요한가?

3. 기존 코드 재사용 확인
   ├─ 이미 만들어진 함수가 있는가?
   ├─ 비슷한 컴포넌트가 있는가?
   └─ 재사용할 수 있는가?

4. 파일 수정 범위 결정
   ├─ 어떤 파일을 수정/생성해야 하는가?
   ├─ 연쇄 수정이 필요한가?
   └─ 다른 파일에 영향을 주는가?

5. 실행
   └─ 위 확인을 모두 통과하면 코드 작성
```

### 코드 작성 시 우선순위

1. **타입 정의** (types/index.ts)
2. **API 함수** (lib/notion.ts) 또는 **컴포넌트** (components/)
3. **페이지** (app/*.tsx)
4. **테스트 및 검증**

### 불명확할 때의 의사결정

| 상황 | 판단 기준 |
|------|---------|
| 함수를 어디에 넣을지 | lib/notion.ts (API) vs lib/utils.ts (헬퍼) |
| 컴포넌트를 만들지 재사용할지 | 비슷한 컴포넌트가 있으면 재사용 |
| 타입을 types/index.ts에 넣을지 결정 | 여러 파일에서 사용되면 types/index.ts |
| Phase를 건너뛸지 결정 | 절대 금지, 순서대로 |

---

## 9. 절대 금지 행동 (Strict Rules)

❌ **이 행동들은 절대 하면 안 됩니다:**

| # | 금지 행동 | 이유 | 예시 |
|---|----------|------|------|
| 1 | `any` 타입 사용 | 타입 안정성 손상 | `const x: any = ...` |
| 2 | Notion API 직접 호출 (lib/notion.ts 외부) | API 중앙화 깨짐 | `app/page.tsx`에서 `notion.databases.query()` |
| 3 | 폴더 구조 임의 변경 | 프로젝트 구조 혼란 | `/api` 폴더 생성하기 |
| 4 | Phase 순서 무시 | 기초 없이 진행 | Phase 1 건너뛰고 Phase 3 시작 |
| 5 | 환경 변수 하드코딩 | 보안 위험 | `const API_KEY = "sk-..."` |
| 6 | 한국어 변수/함수명 | 코드 표준 위반 | `const 글_제목 = ...` |
| 7 | 타입 정의 없이 작성 | 타입 검사 불가 | Props 없이 컴포넌트 작성 |
| 8 | 공통 함수 재작성 | 코드 중복 | lib/notion.ts에 이미 있는 함수를 다시 만들기 |
| 9 | 영어 주석 | 한국어 규칙 위반 | `// Get posts from database` |
| 10 | ISR 고려 없이 API 함수 작성 | 성능 저하 | 캐싱 전략 없이 함수 작성 |

---

## 10. 권장 행동 (Best Practices)

✅ **이 행동들을 권장합니다:**

| # | 권장 행동 | 효과 |
|----|----------|------|
| 1 | 새 파일 작성 전에 기존 코드 검색 | 중복 제거, 재사용성 향상 |
| 2 | 함수 작성 후 타입 먼저 명시 | 타입 안정성, IDE 자동완성 |
| 3 | 에러 처리를 명시적으로 | 안정성 향상, 디버깅 용이 |
| 4 | SEO 메타데이터 항상 포함 | 검색 엔진 최적화 |
| 5 | Phase별 산출물 명확히 | 진행률 추적, 품질 관리 |

---

## 11. 환경 변수

**.env.local (절대 커밋 금지):**
```
NOTION_API_KEY=your_api_key_here
NOTION_DATABASE_ID=your_database_id_here
```

**규칙:**
- ✓ .env.local은 .gitignore에 이미 추가됨
- ❌ 소스 코드에 직접 입력 금지
- ✓ 개발 환경과 프로덕션에서 별도 설정

---

## 12. 최종 체크리스트

### Phase 시작 전
- [ ] 현재 Phase 문서 (PRD.md, ROADMAP.md) 읽음
- [ ] 이전 Phase 모두 완료 확인
- [ ] 필요한 파일/폴더 존재 확인

### 코드 작성 중
- [ ] TypeScript 타입 명시
- [ ] 함수명/변수명 네이밍 규칙 준수
- [ ] 2칸 들여쓰기
- [ ] 한국어 주석 (필요시만)
- [ ] 에러 처리 포함

### 커밋 전
- [ ] `any` 타입 검색해서 제거
- [ ] 환경 변수 하드코딩 확인 및 제거
- [ ] 커밋 메시지 형식 확인 ([Phase N] ...)
- [ ] Phase 산출물 확인

---

**문서 버전:** 1.0  
**생성일:** 2026-04-29  
**담당자:** Chuck Seo  
**상태:** 규칙 확정
