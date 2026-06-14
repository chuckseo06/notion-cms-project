# 개인 글쓰기 블로그 (Personal Blog with Notion CMS)

Notion CMS를 활용한 개인 글쓰기 블로그 프로젝트입니다. Notion에서 글을 작성하면 자동으로 블로그에 반영됩니다.

## 🎯 프로젝트 개요

- **프로젝트명**: 개인 글쓰기 블로그
- **목적**: Notion CMS를 활용한 자동 블로그 시스템
- **특징**: Notion에서만 글을 관리하면 되고, 웹 블로그는 자동으로 최신 콘텐츠를 표시합니다.

## ✨ 주요 기능 (MVP)

- Notion DB에서 Published 포스트 목록 자동 조회 (ISR 1시간 캐시)
- 포스트 상세 페이지 — Notion 블록 타입별 렌더링 (제목, 단락, 코드, 이미지, 목록, 인용 등)
- 태그 기반 필터링 — 태그 클릭으로 해당 태그 포스트만 표시
- 동적 OG 메타태그 생성 — 포스트별 소셜 공유 미리보기
- 커스텀 404 페이지

## 🛠 기술 스택

- **프론트엔드**: [Next.js 16](https://nextjs.org), [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org)
- **CMS**: [@notionhq/client](https://www.npmjs.com/package/@notionhq/client)
- **스타일링**: [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com)
- **아이콘**: [Lucide React](https://lucide.dev)

## 📋 Notion 데이터베이스 속성 구조

| 속성명 | Notion 타입 | 필수 | 설명 |
|--------|------------|------|------|
| Title | title | ✅ | 포스트 제목 |
| Slug | rich_text | ✅ | URL 경로 식별자 (예: `my-first-post`) |
| Published | checkbox | ✅ | 게시 여부 — `true`일 때만 블로그에 노출 |
| PublishedAt | date | ✅ | 포스트 게시 날짜 |
| Tags | multi_select | ✅ | 태그 목록 (태그 필터링에 사용) |
| Excerpt | rich_text | - | 목록 페이지 요약 문구 |
| Cover | files & media | - | 커버 이미지 (파일 업로드 또는 외부 URL) |

## 🚀 시작하기

### 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/yourusername/notion-cms-blog.git
cd notion-cms-blog
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정 (`.env.local` 파일 생성)
```bash
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
```

### 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 프로젝트를 확인할 수 있습니다.

## 📂 프로젝트 구조

```
notion-cms-project/
├── app/
│   ├── layout.tsx              # 전역 레이아웃 (헤더 + 푸터)
│   ├── page.tsx                # 홈 페이지 (포스트 목록 + 태그 필터, ISR)
│   ├── not-found.tsx           # 커스텀 404 페이지
│   ├── globals.css             # TailwindCSS v4 + shadcn 테마 변수
│   ├── favicon.ico
│   └── posts/
│       └── [slug]/
│           └── page.tsx        # 포스트 상세 페이지 (ISR + OG 메타태그)
├── components/
│   ├── blog/
│   │   ├── PostCard.tsx        # 포스트 목록 카드
│   │   ├── TagFilter.tsx       # 태그 필터 (클라이언트 컴포넌트)
│   │   └── NotionRenderer.tsx  # Notion 블록 → HTML 렌더러
│   ├── layout/
│   │   ├── Header.tsx          # 전역 헤더
│   │   └── Footer.tsx          # 전역 푸터
│   └── ui/                     # shadcn/ui 컴포넌트
│       ├── badge.tsx
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── notion.ts               # Notion API 래퍼 (@notionhq/client v5)
│   └── utils.ts                # cn() 유틸리티 (clsx + tailwind-merge)
├── types/
│   └── notion.ts               # Notion 타입 정의
├── docs/
│   └── PRD.md                  # 제품 요구사항 문서
├── .env.example                # 환경 변수 템플릿
├── components.json             # shadcn/ui 설정
├── next.config.ts              # Next.js 설정 (Notion 이미지 도메인 허용)
├── tsconfig.json
└── eslint.config.mjs
```

## 📄 문서

- [PRD (Product Requirements Document)](./docs/PRD.md) - 상세 프로젝트 스펙

## 🔗 유용한 링크

- [Notion API 문서](https://developers.notion.com)
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)

## 📝 라이센스

MIT

## 👨‍💻 개발자

- Email: chuckseo06@gmail.com
