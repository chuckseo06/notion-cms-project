import { z } from 'zod';

// Notion 포스트 메타정보
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

// Notion 리치 텍스트 (포맷팅 정보 포함)
export interface NotionRichText {
  plain_text: string;
  href?: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  text?: {
    content: string;
    link?: { url: string } | null;
  };
}

// Notion 블록 (포스트 본문)
export interface NotionBlock {
  id: string;
  type: string;
  content: any;
  parentId: string | null;
  children?: NotionBlock[];
}

// Zod 스키마 - 런타임 검증
export const NotionPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().default(''),
  coverImage: z.string().nullable().default(null),
  isPublished: z.boolean().default(false),
});

export type NotionPostType = z.infer<typeof NotionPostSchema>;
