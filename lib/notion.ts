// Notion API 클라이언트 래퍼
// @notionhq/client v5를 감싸서 타입 안전한 함수들을 제공합니다.
// v5 Breaking Change: databases.query → dataSources.query (data_source_id 사용)

import { Client } from "@notionhq/client";
import { z } from "zod";
import type { NotionPost, NotionBlock, GetPostsOptions } from "@/types/notion";

// ─── Notion 클라이언트 싱글톤 ─────────────────────────────────────────────────

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// v5에서 Notion DB는 "data source"로 취급됩니다.
// NOTION_DATABASE_ID는 data_source_id로 사용됩니다.
const DATA_SOURCE_ID = process.env.NOTION_DATABASE_ID ?? "";

// ─── 내부 유틸리티 ────────────────────────────────────────────────────────────

/** Notion 리치 텍스트 배열에서 plain_text를 추출하는 헬퍼 */
function extractPlainText(
  richText: Array<{ plain_text: string }>
): string {
  return richText.map((t) => t.plain_text).join("");
}

/** Notion 파일/URL 속성에서 URL을 추출하는 헬퍼 */
function extractFileUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any
): string | null {
  if (!file) return null;
  if (file.type === "file") return file.file?.url ?? null;
  if (file.type === "external") return file.external?.url ?? null;
  return null;
}

// Notion API 페이지 응답 최소 스키마
const NotionPageSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()),
});

// ─── API 함수 ─────────────────────────────────────────────────────────────────

/**
 * Notion DB에서 Published=true인 포스트 목록을 조회합니다.
 * 태그 필터링 옵션을 지원합니다.
 */
export async function getPublishedPosts(
  options: GetPostsOptions = {}
): Promise<NotionPost[]> {
  const { tag, pageSize = 100 } = options;

  // 기본 필터: Published 체크박스가 true인 항목만
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter: any = {
    property: "Published",
    checkbox: { equals: true },
  };

  // 태그 필터 추가 시 AND 조건으로 결합
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = tag
    ? {
        and: [
          baseFilter,
          {
            property: "Tags",
            multi_select: { contains: tag },
          },
        ],
      }
    : baseFilter;

  const response = await notion.dataSources.query({
    data_source_id: DATA_SOURCE_ID,
    filter,
    sorts: [
      {
        property: "PublishedAt",
        direction: "descending",
      },
    ],
    page_size: pageSize,
  });

  return response.results
    .map((page) => mapPageToPost(page))
    .filter((post): post is NotionPost => post !== null);
}

/**
 * 슬러그(Slug)로 단일 포스트를 조회합니다.
 * Published=true 조건을 함께 검사합니다.
 */
export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  const response = await notion.dataSources.query({
    data_source_id: DATA_SOURCE_ID,
    filter: {
      and: [
        {
          property: "Slug",
          rich_text: { equals: slug },
        },
        {
          property: "Published",
          checkbox: { equals: true },
        },
      ],
    },
    page_size: 1,
  });

  if (response.results.length === 0) return null;
  return mapPageToPost(response.results[0]);
}

/**
 * 포스트의 본문 블록들을 페이지 ID로 조회합니다.
 * 중첩 블록(has_children=true)은 재귀적으로 가져옵니다.
 */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  // 페이지네이션으로 모든 블록 수집
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      blocks.push(block as NotionBlock);

      // 하위 블록이 있는 경우 재귀 조회 (목록 들여쓰기, 토글 등)
      if ("has_children" in block && block.has_children) {
        const childBlocks = await getPostBlocks(block.id);
        blocks.push(...childBlocks);
      }
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

/**
 * DB에 존재하는 모든 태그 목록을 중복 없이 반환합니다.
 * 홈 페이지 태그 필터 UI 렌더링에 사용됩니다.
 */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tagSet = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

// ─── 내부 매핑 유틸리티 ───────────────────────────────────────────────────────

/**
 * Notion API 페이지 응답을 NotionPost 타입으로 변환합니다.
 * 속성이 누락되거나 형식이 맞지 않으면 null을 반환합니다.
 */
function mapPageToPost(page: unknown): NotionPost | null {
  try {
    const parsed = NotionPageSchema.parse(page);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = parsed.properties as Record<string, any>;

    // 제목 속성 추출 (Title 또는 Name 프로퍼티)
    const title = extractPlainText(
      props["Title"]?.title ?? props["Name"]?.title ?? []
    );

    // 슬러그 속성 추출
    const slug = extractPlainText(props["Slug"]?.rich_text ?? []);

    // 게시 여부
    const isPublished: boolean = props["Published"]?.checkbox ?? false;

    // 게시 날짜
    const publishedAt: string | null = props["PublishedAt"]?.date?.start ?? null;

    // 태그 목록
    const tags: string[] =
      props["Tags"]?.multi_select?.map(
        (t: { name: string }) => t.name
      ) ?? [];

    // 요약
    const excerpt: string = extractPlainText(props["Excerpt"]?.rich_text ?? []);

    // 커버 이미지
    const coverRaw = props["Cover"]?.files?.[0] ?? null;
    const coverImage = extractFileUrl(coverRaw);

    // slug가 없으면 유효하지 않은 포스트
    if (!slug) return null;

    return {
      id: parsed.id,
      slug,
      title,
      publishedAt,
      tags,
      excerpt,
      coverImage,
      isPublished,
    };
  } catch {
    // 파싱 실패 시 해당 포스트 제외
    return null;
  }
}
