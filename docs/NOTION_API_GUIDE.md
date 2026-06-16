# Notion API 및 Database 구조 가이드

## 목차

1. [개요](#개요)
2. [Notion Integration 설정](#notion-integration-설정)
3. [Database 속성 정의](#database-속성-정의)
4. [Notion API 기초](#notion-api-기초)
5. [포스트 목록 조회 (F001)](#포스트-목록-조회-f001)
6. [포스트 상세 조회 (F002)](#포스트-상세-조회-f002)
7. [블록 조회 및 렌더링](#블록-조회-및-렌더링)
8. [태그 필터링 (F003)](#태그-필터링-f003)
9. [성능 최적화 및 Rate Limiting](#성능-최적화-및-rate-limiting)
10. [에러 처리](#에러-처리)
11. [체크리스트 및 설정 가이드](#체크리스트-및-설정-가이드)

---

## 개요

이 문서는 Notion을 CMS로 활용하는 Next.js 블로그 프로젝트에서 Notion API를 올바르게 연동하기 위한 완벽한 가이드입니다.

### 문서 범위

- **Notion Database 설정**: Integration 생성부터 속성 정의까지
- **API 인증 및 기초**: 토큰 관리, API 구조, 페이지네이션
- **데이터 조회**: 포스트 목록, 포스트 상세, 블록 조회
- **필터링 및 정렬**: 게시 여부 필터, 태그 필터, 날짜 정렬
- **성능 및 안정성**: Rate Limiting, 캐싱 전략, 에러 처리

### PRD와의 매핑

| PRD 기능 ID | 설명 | 관련 섹션 |
|-----------|------|---------|
| F001 | Notion 포스트 목록 조회 | [포스트 목록 조회](#포스트-목록-조회-f001) |
| F002 | 포스트 상세 렌더링 | [포스트 상세 조회](#포스트-상세-조회-f002), [블록 조회](#블록-조회-및-렌더링) |
| F003 | 태그 기반 필터링 | [태그 필터링](#태그-필터링-f003) |
| F010 | Notion API 클라이언트 | [Notion API 기초](#notion-api-기초) |

---

## Notion Integration 설정

### Step 1: Notion Integration 생성

Notion Integration은 외부 애플리케이션(Next.js 블로그)에서 Notion API에 접근할 수 있는 인증 토큰을 발급합니다.

**절차:**

1. https://www.notion.so/my-integrations 접속
2. **+ Create new integration** 클릭
3. 다음 정보 입력:
   - **Name**: `Blog CMS` 또는 `Notion Blog API`
   - **Associated workspace**: 블로그 데이터베이스가 있는 워크스페이스 선택
   - **Capabilities**: 다음 권한 선택:
     - ✅ Read content
     - ✅ Read user information
     - ✅ Insert content (향후 포스트 자동 생성 시)
4. **Save integration** 클릭
5. **Secrets** 탭에서 **Internal Integration Token** 복사

**결과:**
```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

이 토큰을 안전하게 보관하세요. 공개되면 악용될 수 있습니다.

### Step 2: Database 생성 및 Integration 공유

**데이터베이스 생성:**

1. Notion 워크스페이스에서 **+ Add a page** 클릭
2. **Database** 선택
3. 레이아웃: **Table** 선택
4. 이름: **Blog Posts** 또는 원하는 이름 설정

**Integration 공유:**

1. Database 우측 상단 **Share** 클릭
2. **Invite** 섹션에서 앞서 생성한 Integration 검색
3. 선택 후 초대

**Database ID 확인:**

Database 페이지 URL을 확인합니다:
```
https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyyyyyyyyyyyyyyyyyyyyyyyy
```

`?v=` 이전의 32글자(또는 36글자 UUID 형식)가 Database ID입니다:
```
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: 환경 변수 설정

프로젝트의 `.env.local` 파일에 다음을 추가합니다:

```bash
# Notion API 설정
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**주의사항:**
- `.env.local`은 `.gitignore`에 포함되어야 합니다
- 프로덕션 배포 시 환경 변수를 Vercel 대시보드에 등록합니다
- API Key는 절대 Git에 커밋하지 마세요

---

## Database 속성 정의

Notion Database의 **스키마(Schema)**를 정의합니다. 각 속성은 블로그 포스트의 메타데이터를 관리합니다.

### 필수 속성 목록

| 속성명 | Notion 타입 | 데이터 타입 | 설명 | 필수 |
|--------|-----------|----------|------|-----|
| **Title** | Title | string | 포스트 제목 (데이터베이스 기본 속성) | ✅ |
| **Slug** | Text | string | URL 경로용 고유 식별자 (예: `how-to-use-notion-api`) | ✅ |
| **Published** | Checkbox | boolean | 게시 여부 (true: 공개, false: 비공개) | ✅ |
| **PublishedAt** | Date | Date | 포스트 게시 날짜 (정렬용) | ✅ |
| **Tags** | Multi-select | string[] | 태그 분류 (예: React, Next.js, TypeScript) | ✅ |
| **Excerpt** | Text | string | 목록 표시용 요약 문구 (200자 이내 권장) | ✅ |
| **Cover** | Files & media | string \| null | 커버 이미지 URL 또는 Notion 파일 | ✅ |

### 속성별 상세 설정

#### 1. Title (기본 속성 - 자동 생성됨)

```
속성명: Title
타입: Title
설명: 포스트 제목 (Notion 데이터베이스의 기본 속성)
```

**동작:**
- 데이터베이스 생성 시 자동으로 생성됨
- 삭제 불가능
- 모든 포스트는 반드시 Title 값을 가져야 함

**예시:**
```
Next.js 13의 App Router 완벽 가이드
Notion API로 CMS 만들기
TypeScript 고급 타입 시스템
```

#### 2. Slug (Text 속성)

```
속성명: Slug
타입: Text
설명: URL 경로 식별자
```

**설정 팁:**
- **고유성**: 각 포스트는 고유한 Slug을 가져야 함
- **형식**: 소문자, 하이픈(-) 구분 (예: `how-to-build-blog`)
- **자동화**: Title 작성 후 수동으로 작성하거나, 향후 자동화 가능
- **검증**: 특수문자 제거, 공백 제거 후 하이픈으로 변환

**예시:**
```
next-js-app-router-guide
notion-api-cms-tutorial
typescript-advanced-types
```

**API 응답 예:**
```json
{
  "slug": {
    "id": "abcd",
    "type": "rich_text",
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "next-js-app-router-guide",
          "link": null
        }
      }
    ]
  }
}
```

#### 3. Published (Checkbox 속성)

```
속성명: Published
타입: Checkbox
설명: 게시 여부 (체크 = 공개, 미체크 = 비공개)
```

**동작:**
- true: 블로그에 노출 (F001에서 조회 가능)
- false: 블로그에 숨김 (임시 저장용, 데이터 페칭 제외)

**API 응답 예:**
```json
{
  "published": {
    "id": "abcd",
    "type": "checkbox",
    "checkbox": true
  }
}
```

#### 4. PublishedAt (Date 속성)

```
속성명: PublishedAt
타입: Date
설명: 포스트 게시 날짜
```

**설정:**
- **날짜 형식**: YYYY-MM-DD (예: 2026-06-16)
- **시간 포함**: 미포함 (선택사항)
- **타임존**: 로컬 타임존

**동작:**
- 홈 페이지 포스트 목록 정렬 기준
- 포스트 상세 페이지에 "작성일: 2026-06-16" 표시

**API 응답 예:**
```json
{
  "published_at": {
    "id": "abcd",
    "type": "date",
    "date": {
      "start": "2026-06-16",
      "end": null,
      "time_zone": null
    }
  }
}
```

#### 5. Tags (Multi-select 속성)

```
속성명: Tags
타입: Multi-select
설명: 포스트 분류용 태그
```

**사전 옵션 생성:**

Notion UI에서 미리 옵션을 생성합니다. 옵션 추가 방법:

1. Database에서 **Tags** 속성 헤더 클릭
2. **Edit property** 선택
3. **Options** 섹션에서 **+ Add an option** 클릭
4. 태그명 입력 후 색상 선택

**권장 태그 목록:**
```
React (파란색)
Next.js (검은색)
TypeScript (파란색)
JavaScript (노란색)
Node.js (초록색)
API (보라색)
성능 최적화 (주황색)
개발 팁 (분홍색)
```

**API 응답 예:**
```json
{
  "tags": {
    "id": "abcd",
    "type": "multi_select",
    "multi_select": [
      {
        "id": "tag1",
        "name": "React",
        "color": "blue"
      },
      {
        "id": "tag2",
        "name": "Next.js",
        "color": "gray"
      }
    ]
  }
}
```

#### 6. Excerpt (Text 속성)

```
속성명: Excerpt
타입: Text
설명: 목록 표시용 포스트 요약
```

**작성 가이드:**
- 길이: 150-200자 권장
- 내용: 포스트 핵심 내용 요약
- 스포일러 금지: 너무 많은 정보 공개 자제

**예시:**
```
Next.js 13에서 도입된 App Router의 동작 원리와 
Pages Router와의 차이점, 마이그레이션 방법을 다룹니다.
```

**API 응답 예:**
```json
{
  "excerpt": {
    "id": "abcd",
    "type": "rich_text",
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Next.js 13의 App Router 완벽 가이드...",
          "link": null
        }
      }
    ]
  }
}
```

#### 7. Cover (Files & media 속성)

```
속성명: Cover
타입: Files & media
설명: 포스트 커버 이미지 (히어로 이미지)
```

**설정:**
- 파일 업로드 또는 외부 URL 삽입 가능
- Notion 내 파일 저장 또는 외부 CDN 링크 가능

**사용 방법:**

1. **외부 URL 사용 (권장):**
   - Unsplash, Pexels 등에서 이미지 URL 복사
   - 속성에 URL 붙여넣기
   - 예: `https://images.unsplash.com/photo-xxx`

2. **파일 업로드:**
   - 속성 셀에서 드래그 드롭
   - Notion이 서버에 저장

**API 응답 예 (외부 URL):**
```json
{
  "cover": {
    "id": "abcd",
    "type": "files",
    "files": [
      {
        "name": "Cover Image",
        "type": "external",
        "external": {
          "url": "https://images.unsplash.com/photo-xxx"
        }
      }
    ]
  }
}
```

**API 응답 예 (Notion 파일):**
```json
{
  "cover": {
    "id": "abcd",
    "type": "files",
    "files": [
      {
        "name": "image.png",
        "type": "file",
        "file": {
          "url": "https://prod-files-secure.s3.us-west-2.amazonaws.com/...",
          "expiry_time": "2026-06-23T10:00:00.000Z"
        }
      }
    ]
  }
}
```

---

## Notion API 기초

### API 엔드포인트 구조

모든 Notion API 요청은 `https://api.notion.com/v1/` 베이스 URL을 사용합니다.

```
https://api.notion.com/v1/{resource}/{resource_id}/{action}
```

### 인증 (Authorization)

모든 API 요청에는 Bearer 토큰이 필요합니다.

**요청 헤더:**
```http
Authorization: Bearer secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Notion-Version: 2026-03-11
Content-Type: application/json
```

### 주요 API 엔드포인트

| HTTP | 엔드포인트 | 설명 |
|------|-----------|------|
| GET | `/databases/{database_id}` | 데이터베이스 메타데이터 조회 |
| POST | `/databases/{database_id}/query` | 데이터베이스 쿼리 (필터, 정렬) |
| GET | `/pages/{page_id}` | 페이지 속성 조회 |
| GET | `/blocks/{block_id}/children` | 페이지 블록 목록 조회 |
| GET | `/blocks/{block_id}` | 단일 블록 상세 조회 |

### TypeScript 클라이언트 설정

`@notionhq/client` 라이브러리를 사용합니다.

**설치:**
```bash
npm install @notionhq/client
```

**클라이언트 초기화:**
```typescript
// lib/notion.ts
import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
```

**사용 예:**
```typescript
// 페이지 조회
const page = await notion.pages.retrieve({
  page_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
});

// 데이터베이스 쿼리
const response = await notion.databases.query({
  database_id: DATABASE_ID,
  filter: {
    property: "Published",
    checkbox: {
      equals: true,
    },
  },
});
```

### 페이지네이션 (Pagination)

Notion API는 **커서 기반 페이지네이션**을 사용합니다.

**기본 동작:**
- 기본 응답: 최대 100개 항목
- `page_size`: 1-100 (기본값 10)
- `start_cursor`: 다음 페이지 시작점

**응답 구조:**
```json
{
  "object": "list",
  "results": [...],
  "has_more": true,
  "next_cursor": "next_cursor_value"
}
```

**TypeScript 구현 예:**
```typescript
async function getAllPages() {
  let cursor = undefined;
  const allPages = [];

  while (true) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 100,
      start_cursor: cursor,
    });

    allPages.push(...response.results);

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return allPages;
}
```

### 에러 처리 및 재시도

Notion API는 여러 종류의 에러를 반환합니다.

**주요 에러 코드:**

| 상태 | 설명 | 처리 |
|------|------|------|
| 400 | Bad Request | 요청 형식 오류, 필터 문법 검증 |
| 401 | Unauthorized | API Key 없음 또는 만료됨 |
| 403 | Forbidden | 권한 부족 (Integration이 Database에 공유되지 않음) |
| 404 | Not Found | 페이지/블록 미존재 |
| 429 | Too Many Requests | Rate Limit 초과 (아래 참고) |
| 500 | Internal Server Error | Notion 서버 오류 (재시도 권장) |

**에러 처리 예:**
```typescript
try {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
  });
} catch (error) {
  if (error.status === 403) {
    console.error("Integration이 Database에 공유되지 않았습니다");
  } else if (error.status === 404) {
    console.error("Database ID가 잘못되었습니다");
  } else {
    console.error(`API 에러: ${error.status} - ${error.message}`);
  }
}
```

---

## 포스트 목록 조회 (F001)

### 요구사항 (PRD)

- Notion DB에서 **Published=true**인 포스트만 조회
- **PublishedAt** 기준으로 최신순 정렬
- 포스트 메타정보: 제목, 날짜, 태그, 요약, 커버 이미지

### 데이터 모델

```typescript
// types/notion.ts
export interface NotionPost {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date;
  tags: string[];
  excerpt: string;
  coverImage: string | null;
  isPublished: boolean;
}
```

### API 쿼리 구조

**필터 조건:**
- Property: `Published`
- Type: `checkbox`
- Condition: `equals: true`

**정렬:**
- Property: `PublishedAt`
- Direction: `descending` (최신순)

### TypeScript 구현

```typescript
// lib/notion-blog.ts
import { Client, isFullPage } from "@notionhq/client";
import { NotionPost } from "@/types/notion";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function getAllPosts(): Promise<NotionPost[]> {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "PublishedAt",
        direction: "descending",
      },
    ],
    page_size: 100,
  });

  const posts: NotionPost[] = [];

  for (const page of response.results) {
    if (!isFullPage(page)) continue;

    const post = parsePost(page);
    if (post) posts.push(post);
  }

  return posts;
}

function parsePost(page: any): NotionPost | null {
  const { properties } = page;

  // 필수 필드 추출
  const title = extractText(properties.Title);
  const slug = extractText(properties.Slug);
  const publishedAt = extractDate(properties.PublishedAt);
  const isPublished = properties.Published?.checkbox ?? false;

  if (!title || !slug || !publishedAt) {
    console.warn(`포스트 ID ${page.id}에서 필수 필드 누락`);
    return null;
  }

  return {
    id: page.id,
    slug,
    title,
    publishedAt,
    tags: extractMultiSelect(properties.Tags),
    excerpt: extractText(properties.Excerpt) ?? "",
    coverImage: extractCoverUrl(properties.Cover),
    isPublished,
  };
}

// 헬퍼 함수들
function extractText(property: any): string | null {
  if (property.type === "title") {
    return property.title
      .map((block: any) => block.plain_text)
      .join("");
  }
  if (property.type === "rich_text") {
    return property.rich_text
      .map((block: any) => block.plain_text)
      .join("");
  }
  return null;
}

function extractDate(property: any): Date | null {
  if (property.type === "date" && property.date?.start) {
    return new Date(property.date.start);
  }
  return null;
}

function extractMultiSelect(property: any): string[] {
  if (property.type === "multi_select") {
    return property.multi_select.map((option: any) => option.name);
  }
  return [];
}

function extractCoverUrl(property: any): string | null {
  if (property.type === "files" && property.files.length > 0) {
    const file = property.files[0];
    if (file.type === "external") {
      return file.external.url;
    } else if (file.type === "file") {
      return file.file.url;
    }
  }
  return null;
}
```

### Next.js 페이지 구현

```typescript
// app/page.tsx (홈 페이지)
import { getAllPosts } from "@/lib/notion-blog";
import PostCard from "@/components/PostCard";

export const revalidate = 3600; // ISR: 1시간마다 재생성

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">블로그</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-500">아직 게시된 포스트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 포스트 상세 조회 (F002)

### 요구사항 (PRD)

- 포스트의 모든 메타정보 표시
- Notion 블록을 HTML로 렌더링
- 코드 블록 구문 강조
- OG 메타태그 생성

### 포스트 페이지 메타정보 조회

```typescript
export async function getPost(slug: string): Promise<NotionPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
```

### 페이지 블록 조회

Notion 페이지의 본문은 "블록"으로 구성됩니다. 각 블록은 단락, 제목, 이미지, 코드 등 다양한 타입을 가질 수 있습니다.

**API 호출:**
```typescript
export async function getPageBlocks(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
  });

  return response.results;
}
```

### 블록 타입과 응답 구조

Notion API는 30개 이상의 블록 타입을 지원합니다. 블로그에서는 다음 타입을 우선 구현합니다:

#### 1. Paragraph (단락)

```json
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a paragraph",
          "link": null
        },
        "annotations": {
          "bold": false,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        }
      }
    ],
    "color": "default"
  }
}
```

**렌더링:**
```tsx
<p className="my-4 text-base leading-relaxed">
  {block.paragraph.rich_text.map((text) => (
    <span key={text.id}>
      {text.text.content}
    </span>
  ))}
</p>
```

#### 2. Heading (제목)

```json
{
  "type": "heading_1",
  "heading_1": {
    "rich_text": [
      { "type": "text", "text": { "content": "Main Title" } }
    ]
  }
}
```

**렌더링:**
```tsx
{block.type === "heading_1" && (
  <h1 className="text-3xl font-bold my-6">
    {block.heading_1.rich_text.map((text) => text.text.content).join("")}
  </h1>
)}
{block.type === "heading_2" && (
  <h2 className="text-2xl font-bold my-4">...</h2>
)}
{block.type === "heading_3" && (
  <h3 className="text-xl font-bold my-3">...</h3>
)}
```

#### 3. Code Block (코드)

```json
{
  "type": "code",
  "code": {
    "rich_text": [
      { "type": "text", "text": { "content": "const x = 42;" } }
    ],
    "language": "javascript",
    "caption": []
  }
}
```

**Shiki를 사용한 렌더링:**
```typescript
import { codeToHtml } from "shiki";

async function renderCodeBlock(block: any) {
  const code = block.code.rich_text.map((t: any) => t.text.content).join("");
  const language = block.code.language || "plain";

  const html = await codeToHtml(code, {
    lang: language,
    theme: "github-light",
  });

  return html;
}
```

#### 4. Image (이미지)

```json
{
  "type": "image",
  "image": {
    "type": "file",
    "file": {
      "url": "https://...",
      "expiry_time": "..."
    }
  }
}
```

**렌더링:**
```tsx
{block.type === "image" && (
  <figure className="my-8">
    <img
      src={block.image.file.url}
      alt="Post image"
      className="w-full rounded-lg"
    />
  </figure>
)}
```

#### 5. Bulleted List / Numbered List

```json
{
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": [
      { "type": "text", "text": { "content": "First item" } }
    ]
  }
}
```

**렌더링:**
```tsx
{block.type === "bulleted_list_item" && (
  <ul className="list-disc list-inside my-4">
    <li>{block.bulleted_list_item.rich_text.map(t => t.text.content).join("")}</li>
  </ul>
)}
```

#### 6. Quote (인용)

```json
{
  "type": "quote",
  "quote": {
    "rich_text": [
      { "type": "text", "text": { "content": "Famous quote" } }
    ]
  }
}
```

**렌더링:**
```tsx
{block.type === "quote" && (
  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
    {block.quote.rich_text.map(t => t.text.content).join("")}
  </blockquote>
)}
```

#### 7. Divider (구분선)

```json
{
  "type": "divider",
  "divider": {}
}
```

**렌더링:**
```tsx
{block.type === "divider" && <hr className="my-8" />}
```

---

## 블록 조회 및 렌더링

### 재귀적 블록 조회

일부 블록은 자식 블록을 포함할 수 있습니다(예: 토글, 테이블).

```typescript
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

      // 자식 블록이 있는 경우 재귀 처리
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

### 블록 렌더링 컴포넌트

```typescript
// components/BlockRenderer.tsx
import { Fragment } from "react";
import { codeToHtml } from "shiki";

interface BlockRendererProps {
  block: any;
}

export async function BlockRenderer({ block }: BlockRendererProps) {
  const { type } = block;

  switch (type) {
    case "paragraph":
      return (
        <p className="my-4 text-base leading-relaxed">
          {block.paragraph?.rich_text.map((text: any) => (
            <RichText key={text.id} text={text} />
          ))}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-3xl font-bold my-6">
          {block.heading_1?.rich_text.map((text: any) => text.text.content).join("")}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-2xl font-bold my-4">
          {block.heading_2?.rich_text.map((text: any) => text.text.content).join("")}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-xl font-bold my-3">
          {block.heading_3?.rich_text.map((text: any) => text.text.content).join("")}
        </h3>
      );

    case "code":
      const code = block.code?.rich_text.map((t: any) => t.text.content).join("");
      const language = block.code?.language || "plain";
      const html = await codeToHtml(code, {
        lang: language,
        theme: "github-light",
      });
      return (
        <div
          className="my-4 rounded-lg bg-gray-900 text-white p-4 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );

    case "image":
      const imageUrl = block.image?.file?.url || block.image?.external?.url;
      return (
        <figure className="my-8">
          <img
            src={imageUrl}
            alt="Post image"
            className="w-full rounded-lg"
          />
        </figure>
      );

    case "bulleted_list_item":
      return (
        <ul className="list-disc list-inside my-4">
          <li>
            {block.bulleted_list_item?.rich_text
              .map((text: any) => text.text.content)
              .join("")}
          </li>
        </ul>
      );

    case "numbered_list_item":
      return (
        <ol className="list-decimal list-inside my-4">
          <li>
            {block.numbered_list_item?.rich_text
              .map((text: any) => text.text.content)
              .join("")}
          </li>
        </ol>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
          {block.quote?.rich_text
            .map((text: any) => text.text.content)
            .join("")}
        </blockquote>
      );

    case "divider":
      return <hr className="my-8" />;

    default:
      return null;
  }
}

// RichText 포맷팅 헬퍼
function RichText({ text }: { text: any }) {
  const { bold, italic, strikethrough, code, underline, color } =
    text.annotations ?? {};

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

### 포스트 상세 페이지 구현

```typescript
// app/posts/[slug]/page.tsx
import { getPost, getPageBlocksRecursive } from "@/lib/notion-blog";
import { BlockRenderer } from "@/components/BlockRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const blocks = await getPageBlocksRecursive(post.id);

  return (
    <article className="container mx-auto max-w-3xl py-12">
      {/* 커버 이미지 */}
      {post.coverImage && (
        <div className="mb-8 -mx-4 md:mx-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* 메타정보 */}
      <header className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <time dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString("ko-KR")}
          </time>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="inline-block bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700 hover:bg-gray-300"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* 본문 */}
      <main className="prose prose-lg max-w-none">
        {blocks.map((block) => (
          <Fragment key={block.id}>
            <BlockRenderer block={block} />
          </Fragment>
        ))}
      </main>
    </article>
  );
}
```

---

## 태그 필터링 (F003)

### 요구사항

- 홈 페이지에서 태그 필터 UI 제공
- 특정 태그 클릭 시 해당 태그를 포함한 포스트만 표시
- URL 쿼리 파라미터로 필터 상태 유지

### 태그로 필터링하는 API 쿼리

```typescript
export async function getPostsByTag(tagName: string): Promise<NotionPost[]> {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Tags",
          multi_select: {
            contains: tagName,
          },
        },
      ],
    },
    sorts: [
      {
        property: "PublishedAt",
        direction: "descending",
      },
    ],
  });

  return response.results
    .map((page) => isFullPage(page) ? parsePost(page) : null)
    .filter((post): post is NotionPost => post !== null);
}
```

### 모든 고유 태그 추출

```typescript
export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagsSet = new Set<string>();

  for (const post of posts) {
    post.tags.forEach((tag) => tagsSet.add(tag));
  }

  return Array.from(tagsSet).sort();
}
```

### 필터 UI 구현

```typescript
// components/TagFilter.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface TagFilterProps {
  tags: string[];
  selectedTag?: string;
}

export default function TagFilter({ tags, selectedTag }: TagFilterProps) {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {/* 전체 보기 */}
      <Link
        href="/"
        className={`px-4 py-2 rounded-full font-medium transition ${
          !selectedTag
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        전체
      </Link>

      {/* 각 태그 */}
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/?tag=${encodeURIComponent(tag)}`}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedTag === tag
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
```

### 홈 페이지 필터 적용

```typescript
// app/page.tsx
import { getAllPosts, getPostsByTag, getAllTags } from "@/lib/notion-blog";
import TagFilter from "@/components/TagFilter";
import PostCard from "@/components/PostCard";
import { Suspense } from "react";

interface HomePageProps {
  searchParams: Promise<{ tag?: string }>;
}

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

      {/* 태그 필터 */}
      <TagFilter tags={allTags} selectedTag={selectedTag} />

      {/* 포스트 목록 */}
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {selectedTag
            ? `"${selectedTag}" 태그 포스트가 없습니다.`
            : "게시된 포스트가 없습니다."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 성능 최적화 및 Rate Limiting

### Rate Limiting

Notion API는 **3개 요청/초** 제한이 있습니다. 초과 시 429 상태 코드를 반환합니다.

**재시도 로직:**

```typescript
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1초

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error.status === 429 && retries > 0) {
      const delay = INITIAL_DELAY * (MAX_RETRIES - retries + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

// 사용
const posts = await withRetry(() =>
  notion.databases.query({
    database_id: DATABASE_ID,
  })
);
```

### 캐싱 전략

**ISR (Incremental Static Regeneration):**

```typescript
// app/page.tsx
export const revalidate = 3600; // 1시간마다 재검증

// 또는
export const dynamicParams = false; // 동적 경로 사전 생성 비활성화
```

**사용자 정의 캐싱:**

```typescript
import { unstable_cache } from "next/cache";

const getCachedPosts = unstable_cache(
  async () => getAllPosts(),
  ["all-posts"],
  { revalidate: 3600, tags: ["posts"] }
);

export async function revalidatePosts() {
  revalidateTag("posts");
}
```

### 페이지 사전 생성 (Static Generation)

```typescript
// app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

---

## 에러 처리

### 주요 시나리오별 처리

#### 1. API Key 누락 또는 잘못됨

```typescript
if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY 환경 변수가 설정되지 않았습니다.");
}
```

#### 2. Database ID 잘못됨

```typescript
try {
  const db = await notion.databases.retrieve({
    database_id: DATABASE_ID,
  });
} catch (error: any) {
  if (error.status === 404) {
    console.error("Database ID가 잘못되었거나 접근 권한이 없습니다.");
  }
}
```

#### 3. Integration이 Database에 공유되지 않음

```
Error: 403 Forbidden - Integration does not have access to this database
```

**해결:**
1. Notion Database 우측 상단 **Share** 클릭
2. Integration 검색 후 초대

#### 4. 필터 문법 오류

```
Error: 400 Bad Request - Invalid filter
```

**해결:**
- 속성명이 정확한지 확인
- 속성 타입과 필터 조건이 일치하는지 확인 (예: checkbox는 `equals`, text는 `contains`)

---

## 체크리스트 및 설정 가이드

### Notion 워크스페이스 설정 체크리스트

#### Phase 1: Integration 및 Database 생성

- [ ] **Integration 생성**
  - https://www.notion.so/my-integrations 접속
  - "Blog CMS" Integration 생성
  - Internal Integration Token 복사
  - `.env.local`에 `NOTION_API_KEY` 저장

- [ ] **Database 생성**
  - Notion에서 **Blog Posts** Database 생성 (Table 레이아웃)
  - Integration과 공유
  - Database ID를 `.env.local`에 `NOTION_DATABASE_ID` 저장

#### Phase 2: 속성 설정

- [ ] **Title** (기본 속성, 이미 생성됨)
  - 수정 불필요

- [ ] **Slug** (Text 타입)
  - 속성 생성
  - 설명: "URL 경로 식별자 (예: next-js-guide)"

- [ ] **Published** (Checkbox 타입)
  - 속성 생성
  - 기본값: unchecked

- [ ] **PublishedAt** (Date 타입)
  - 속성 생성
  - 형식: Date only

- [ ] **Tags** (Multi-select 타입)
  - 속성 생성
  - 옵션 추가:
    - [ ] React
    - [ ] Next.js
    - [ ] TypeScript
    - [ ] JavaScript
    - [ ] Node.js
    - [ ] 성능 최적화

- [ ] **Excerpt** (Text 타입)
  - 속성 생성
  - 설명: "포스트 목록용 요약 (150-200자)"

- [ ] **Cover** (Files & media 타입)
  - 속성 생성
  - 파일 또는 URL 선택 가능

#### Phase 3: 테스트 데이터 작성

- [ ] **테스트 포스트 1개 작성**
  - Title: "첫 번째 포스트"
  - Slug: "first-post"
  - Published: ✓ (체크)
  - PublishedAt: 오늘 날짜
  - Tags: React, Next.js
  - Excerpt: "이것은 테스트 포스트입니다."
  - Cover: 적절한 이미지 URL 설정

- [ ] **테스트 포스트에 블록 추가**
  - Paragraph (텍스트)
  - Heading (제목)
  - Code block (예: JavaScript 코드)
  - Image (이미지)
  - Bullet list (목록)

#### Phase 4: 프로젝트 환경 설정

- [ ] **.env.local 파일 생성**
  ```bash
  NOTION_API_KEY=secret_xxxxx
  NOTION_DATABASE_ID=xxxxx
  ```

- [ ] **.gitignore에 .env.local 포함**
  ```
  .env.local
  ```

- [ ] **@notionhq/client 설치**
  ```bash
  npm install @notionhq/client
  ```

- [ ] **lib/notion.ts 파일 생성**
  (위의 클라이언트 초기화 코드 참고)

#### Phase 5: API 연동 테스트

- [ ] **getAllPosts() 함수 테스트**
  ```bash
  node -e "require('./lib/notion').getAllPosts().then(console.log)"
  ```

- [ ] **getPost() 함수 테스트**
  - 테스트 포스트의 slug로 조회

- [ ] **getPageBlocksRecursive() 함수 테스트**
  - 블록이 올바르게 조회되는지 확인

- [ ] **태그 필터링 테스트**
  - getPostsByTag("React")로 필터 확인

#### Phase 6: 배포 준비

- [ ] **Vercel 환경 변수 설정**
  - Vercel 대시보드 → Project settings → Environment Variables
  - `NOTION_API_KEY` 추가
  - `NOTION_DATABASE_ID` 추가

- [ ] **ISR revalidate 값 설정**
  - app/page.tsx: 3600 (1시간)
  - app/posts/[slug]/page.tsx: 3600

- [ ] **Error handling 테스트**
  - 잘못된 Database ID로 테스트
  - API Key 없을 때 테스트
  - 존재하지 않는 포스트 접근 테스트

### 문제 해결 가이드

#### 403 Forbidden 에러

**원인:** Integration이 Database에 공유되지 않았음

**해결:**
```
1. Notion Database 열기
2. 우측 상단 "Share" 클릭
3. Integration 검색 후 추가
4. 권한: "Can edit" 설정
```

#### 404 Not Found 에러

**원인:** Database ID가 잘못됨

**해결:**
```
1. Database 페이지 URL 확인
2. ?v= 이전 부분을 DATABASE_ID로 사용
3. .env.local 파일 수정
4. 개발 서버 재시작
```

#### 400 Bad Request (Invalid filter)

**원인:** 필터 문법 오류

**해결:**
```typescript
// ❌ 잘못된 예
filter: {
  property: "IsPublished", // 속성명 오타
  checkbox: { equals: true }
}

// ✅ 올바른 예
filter: {
  property: "Published", // 정확한 속성명
  checkbox: { equals: true }
}
```

#### 429 Too Many Requests

**원인:** API 요청 한도 초과 (3req/sec)

**해결:**
- 위의 "Rate Limiting" 섹션의 재시도 로직 적용
- 배치 요청 최소화
- 캐싱 활용

---

## 추가 참고 자료

- [Notion API 공식 문서](https://developers.notion.com)
- [@notionhq/client npm 패키지](https://www.npmjs.com/package/@notionhq/client)
- [Notion 데이터 모델 구조](https://developers.notion.com/guides/data-apis)
- [Next.js ISR 가이드](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

---

## 문서 버전

| 버전 | 작성일 | 변경사항 |
|------|--------|---------|
| 1.0 | 2026-06-16 | 초판 작성 |

**작성자:** Claude Code (AI Assistant)  
**마지막 업데이트:** 2026-06-16
