# 개인 글쓰기 블로그 (Personal Blog with Notion CMS)

Notion CMS를 활용한 개인 글쓰기 블로그 프로젝트입니다. Notion에서 글을 작성하면 자동으로 블로그에 반영됩니다.

## 🎯 프로젝트 개요

- **프로젝트명**: 개인 글쓰기 블로그
- **목적**: Notion CMS를 활용한 자동 블로그 시스템
- **특징**: Notion에서만 글을 관리하면 되고, 웹 블로그는 자동으로 최신 콘텐츠를 표시합니다.

## ✨ 주요 기능

- ✅ Notion 데이터베이스에서 글 목록 자동 조회
- ✅ 개별 글 상세 페이지
- ✅ 카테고리별 필터링
- ✅ 검색 기능 (예정)
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)

## 🛠 기술 스택

- **프론트엔드**: [Next.js 16](https://nextjs.org), [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org)
- **CMS**: [@notionhq/client](https://www.npmjs.com/package/@notionhq/client)
- **스타일링**: [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com)
- **아이콘**: [Lucide React](https://lucide.dev)

## 📋 Notion 데이터베이스 구조

| 필드명 | 타입 | 설명 |
|-------|------|------|
| Title | title | 글 제목 |
| Category | select | 카테고리 |
| Tag | multi_select | 태그 목록 |
| Published | date | 발행일 |
| Status | select | 초안/발행됨 |
| Content | page content | 글 본문 |

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
├── app/                  # Next.js 앱 라우터
│   ├── layout.tsx       # 루트 레이아웃
│   ├── page.tsx         # 홈 페이지
│   ├── globals.css      # 글로벌 스타일
│   └── favicon.ico
├── components/          # React 컴포넌트
│   └── ui/             # shadcn/ui 컴포넌트
├── lib/                # 유틸리티 함수
├── docs/               # 문서
│   └── PRD.md         # 제품 요구사항 문서
├── public/            # 정적 파일
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
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
