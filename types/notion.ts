// Notion CMS 블로그 타입 정의

/**
 * Notion DB에서 가져온 블로그 포스트 메타데이터
 * Notion 워크스페이스의 DB 속성과 1:1 매핑됩니다.
 */
export interface NotionPost {
  /** Notion Page ID (UUID 형식) */
  id: string;
  /** URL 경로용 고유 슬러그 (예: "my-first-post") */
  slug: string;
  /** 포스트 제목 */
  title: string;
  /** 게시 날짜 (ISO 8601) */
  publishedAt: string | null;
  /** 태그 목록 (Notion 다중 선택 속성) */
  tags: string[];
  /** 목록 표시용 요약 문구 */
  excerpt: string;
  /** 커버 이미지 URL (없으면 null) */
  coverImage: string | null;
  /** 게시 여부 (Published 체크박스) */
  isPublished: boolean;
}

/**
 * Notion 블록 타입 (포스트 본문 구성 요소)
 * Notion API의 BlockObjectResponse 기반
 */
export type NotionBlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "code"
  | "image"
  | "quote"
  | "divider"
  | "callout"
  | "toggle"
  | "to_do"
  | "embed"
  | "video"
  | "file"
  | "pdf"
  | "bookmark"
  | "table"
  | "table_row"
  | "column_list"
  | "column"
  | "child_page"
  | "unsupported";

/**
 * Notion 리치 텍스트 조각 (Bold, Italic, Link 등 인라인 서식 포함)
 */
export interface NotionRichText {
  type: "text" | "mention" | "equation";
  text?: {
    content: string;
    link: { url: string } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
}

/**
 * Notion 블록 (포스트 본문 개별 단위)
 */
export interface NotionBlock {
  /** 블록 고유 ID */
  id: string;
  /** 블록 타입 */
  type: NotionBlockType;
  /** 하위 블록 보유 여부 */
  has_children: boolean;
  /** 블록 실제 데이터 (Notion API 원본 응답) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * 포스트 목록 조회 옵션
 */
export interface GetPostsOptions {
  /** 필터링할 태그 (없으면 전체 조회) */
  tag?: string;
  /** 최대 조회 수 */
  pageSize?: number;
}
