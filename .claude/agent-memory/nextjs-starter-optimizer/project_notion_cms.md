---
name: Notion CMS 블로그 프로젝트 설정
description: @notionhq/client v5 + Next.js 16 + TailwindCSS v4 + shadcn/ui 스택의 핵심 변경사항 및 아키텍처
type: project
---

이 프로젝트는 Notion을 CMS로 사용하는 개인 블로그입니다. Next.js 16 App Router 기반으로 ISR을 활용합니다.

**Why:** 1인 개발자가 Notion에서 글을 작성하면 별도 배포 없이 블로그에 자동 반영하려는 목적.

**How to apply:** 새 기능 추가 시 반드시 아래 버전별 API 변경사항을 먼저 확인하고 구현할 것.

## 핵심 Breaking Changes (미래 대화에서 반드시 확인)

### @notionhq/client v5 (현재: 5.20.0)
- `databases.query()` **제거됨** → `dataSources.query()` 사용
- `database_id` → `data_source_id` 파라미터 이름 변경
- `Client`는 **named export**: `import { Client } from "@notionhq/client"`
- Notion API 버전: 2025-09-03 (defaultNotionVersion)

### Zod v4 (현재: 4.4.3)
- `z.record()` 는 **반드시 키 타입 포함 2인수** 필요: `z.record(z.string(), z.unknown())`
- 1인수(`z.record(z.unknown())`)는 TypeScript 타입 오류 발생 (런타임은 동작하지만 tsc 실패)

### Next.js 16 (App Router)
- `params`, `searchParams`는 **Promise 타입**: `const { slug } = await params`
- `generateStaticParams`는 Notion API 미설정 시 빈 배열 반환 필요 (try/catch)
- ISR: `export const revalidate = 3600` 방식 사용

### TailwindCSS v4
- 설정 파일(`tailwind.config.js`) **없음** — CSS 파일 import 방식
- `@import "tailwindcss"` + `@import "shadcn/tailwind.css"` 순서 중요
- `tw-animate-css` 는 블로그 목적에서 **불필요** — 제거됨

### shadcn/ui
- `shadcn` 패키지는 **devDependencies**에 위치해야 함 (CLI 도구)
- `components.json`의 `style: "radix-nova"` 사용 중
- `sidebar` 관련 CSS 변수는 블로그에서 **불필요** — globals.css에서 제거

## 프로젝트 구조 (초기화 완료 상태)
```
app/
  layout.tsx         — 전역 레이아웃 (Header + Footer)
  page.tsx           — 홈 (포스트 목록 + 태그 필터)
  not-found.tsx      — 커스텀 404
  posts/[slug]/
    page.tsx         — 포스트 상세 (ISR + OG 메타태그)
components/
  blog/
    PostCard.tsx     — 포스트 카드
    TagFilter.tsx    — 태그 필터 (클라이언트 컴포넌트)
    NotionRenderer.tsx — 블록 렌더러 (Image import 제거됨, img 태그 사용)
  layout/
    Header.tsx
    Footer.tsx
  ui/               — shadcn 컴포넌트 (badge, button, card)
lib/
  notion.ts         — Notion API 래퍼
  utils.ts          — cn() 유틸리티
types/
  notion.ts         — 타입 정의
```

## 환경 변수 (.env.example 포함됨)
- `NOTION_API_KEY` — Notion Integration 시크릿
- `NOTION_DATABASE_ID` — v5에서 data_source_id로 사용됨
- `NEXT_PUBLIC_BLOG_TITLE`, `NEXT_PUBLIC_BLOG_DESCRIPTION`, `NEXT_PUBLIC_SITE_URL`

## 주요 린트/빌드 주의사항
- `NotionRenderer.tsx`: `next/image`의 `Image`는 사용하지 않음 — `<img>` 태그 직접 사용 (eslint no-unused-vars 대상)
- 빌드 시 Notion API 경고는 Integration 미공유 상태에서 정상 — try/catch로 빈 배열 반환
- `npm run build` 성공 확인됨 (tsc + eslint + next build 모두 통과)
