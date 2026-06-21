import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionPost, NotionBlock } from "@/types/notion";

// 환경 변수 로드 및 검증
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY 환경 변수가 설정되지 않았습니다.");
}

if (!NOTION_DATABASE_ID) {
  throw new Error("NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.");
}

// Notion 클라이언트 초기화 (싱글톤 패턴)
// baseUrl 옵션 제거 (SDK에서 자동으로 처리)
export const notion = new Client({
  auth: NOTION_API_KEY,
});

// 에러 타입 정의
export class NotionAPIError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "NotionAPIError";
  }
}

// 헬퍼 함수: 텍스트 속성 추출 (Title, Rich Text 타입 지원)
export function extractText(property: any): string {
  if (!property) {
    return "";
  }

  // Title 타입 처리
  if (property.type === "title") {
    return (property.title ?? []).map((item: any) => item.plain_text).join("");
  }

  // Rich Text 타입 처리 (Slug, Excerpt 등)
  if (property.type === "rich_text") {
    return (property.rich_text ?? []).map((item: any) => item.plain_text).join("");
  }

  return "";
}

// 헬퍼 함수: 날짜 속성 추출
export function extractDate(property: any): Date | null {
  if (!property || property.type !== "date" || !property.date) {
    return null;
  }
  const dateStr = property.date.start;
  if (!dateStr) return null;
  return new Date(dateStr);
}

// 헬퍼 함수: 다중선택 속성 추출 (Tags)
export function extractMultiSelect(property: any): string[] {
  if (!property || property.type !== "multi_select") {
    return [];
  }
  const options = property.multi_select || [];
  return options.map((option: any) => option.name);
}

// 헬퍼 함수: 커버 이미지 URL 추출
export function extractCoverUrl(property: any): string | null {
  if (!property) {
    return null;
  }

  // Files & media 속성
  if (property.type === "files" && property.files && property.files.length > 0) {
    const file = property.files[0];
    if (file.type === "file" && file.file?.url) {
      return file.file.url;
    }
    if (file.type === "external" && file.external?.url) {
      return file.external.url;
    }
  }

  return null;
}

// 에러 처리 함수
export function handleNotionError(error: any): NotionAPIError {
  if (error.status === 401) {
    return new NotionAPIError(
      "UNAUTHORIZED",
      "Notion API 인증 오류: NOTION_API_KEY를 확인하세요."
    );
  }

  if (error.status === 403) {
    return new NotionAPIError(
      "FORBIDDEN",
      "Notion Database 접근 권한 오류: Integration이 Database에 공유되었는지 확인하세요."
    );
  }

  if (error.status === 404) {
    return new NotionAPIError(
      "NOT_FOUND",
      "Notion Database를 찾을 수 없습니다: NOTION_DATABASE_ID를 확인하세요."
    );
  }

  if (error.status === 429) {
    return new NotionAPIError(
      "RATE_LIMIT",
      "Notion API Rate Limit 초과: 잠시 후 다시 시도하세요."
    );
  }

  return new NotionAPIError(
    error.code || "UNKNOWN",
    error.message || "Notion API 오류가 발생했습니다."
  );
}

// parsePost 함수 (Phase 1.3.4에서 구현)
function parsePost(page: PageObjectResponse): NotionPost | null {
  try {
    const properties = page.properties as Record<string, any>;

    const title = extractText(properties.Title);
    const slug = extractText(properties.Slug);
    const publishedAt = extractDate(properties.PublishedAt);
    const tags = extractMultiSelect(properties.Tags);
    const excerpt = extractText(properties.Excerpt);
    const coverImage = extractCoverUrl(properties.Cover);
    const isPublished = properties.Published?.checkbox ?? false;

    // 필수 필드 검증
    if (!title || !slug || !publishedAt) {
      console.warn(
        `[Notion API] 포스트 파싱 오류: 포스트 ${page.id}의 필수 필드 누락`
      );
      return null;
    }

    return {
      id: page.id,
      slug,
      title,
      publishedAt,
      tags,
      excerpt,
      coverImage,
      isPublished,
    };
  } catch (error) {
    console.error(`[Notion API] 포스트 ${page.id} 파싱 중 오류:`, error);
    return null;
  }
}

// getAllPosts 함수 (Phase 1.3.5에서 구현)
// @notionhq/client v5.22.0의 dataSources.query() 메소드 사용
// 주의: database_id와 data_source_id는 다르다!
// 먼저 database 메타데이터에서 data_source_id를 추출해야 한다.
export async function getAllPosts(): Promise<NotionPost[]> {
  try {
    console.log(`[Notion API] Database 메타데이터 조회 중...`);

    // Step 1: Database 메타데이터 조회 (data_source_id 추출용)
    const databaseInfo = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });

    // data_sources 배열에서 첫 번째 data source ID 추출
    const dataSourceId = databaseInfo.data_sources?.[0]?.id;
    if (!dataSourceId) {
      throw new Error(
        "Database에서 data_source_id를 찾을 수 없습니다. Database가 올바르게 설정되었는지 확인하세요."
      );
    }

    console.log(`[Notion API] data_source_id: ${dataSourceId}`);
    console.log(`[Notion API] dataSources.query() 호출 시작...`);

    // Step 2: dataSources.query() 호출 (올바른 data_source_id 사용)
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
      sorts: [
        {
          property: "PublishedAt",
          direction: "descending",
        },
      ],
      page_size: 100,
    });

    console.log(`[Notion API] 응답 받음. 결과 개수: ${response.results?.length || 0}`);

    const posts: NotionPost[] = [];
    if (response.results) {
      for (const page of response.results) {
        if (page.object !== "page") continue;

        const post = parsePost(page as PageObjectResponse);
        if (post) {
          posts.push(post);
          console.log(`[Notion API] ✅ 포스트 추가: ${post.title}`);
        }
      }
    }

    console.log(`[Notion API] 포스트 ${posts.length}개 조회 완료`);
    return posts;
  } catch (error: any) {
    console.error(`[Notion API] 포스트 조회 실패:`, error);
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 상세: ${notionError.message}`);
    throw notionError;
  }
}

// getAllTags 함수 (Phase 2.3에서 구현)
// 모든 게시 포스트에서 고유 태그 추출 및 알파벳 정렬
export async function getAllTags(): Promise<string[]> {
  try {
    const posts = await getAllPosts();
    const tagSet = new Set<string>();

    for (const post of posts) {
      post.tags.forEach((tag) => tagSet.add(tag));
    }

    const tags = Array.from(tagSet).sort();
    console.log(`[Notion API] 고유 태그 ${tags.length}개 추출됨`);
    return tags;
  } catch (error: any) {
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 태그 추출 실패:`, notionError.message);
    throw notionError;
  }
}

// getPostsByTag 함수 (Phase 2.3에서 구현)
// 특정 태그를 포함하는 게시 포스트만 필터링
export async function getPostsByTag(tag: string): Promise<NotionPost[]> {
  try {
    const posts = await getAllPosts();
    const filtered = posts.filter((post) => post.tags.includes(tag));
    console.log(`[Notion API] 태그 '${tag}'의 포스트 ${filtered.length}개 필터링됨`);
    return filtered;
  } catch (error: any) {
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 태그 필터링 실패:`, notionError.message);
    throw notionError;
  }
}

// getPublishedPosts 함수 (Phase 2에서 구현)
// 게시 포스트 조회 (태그별 필터링 선택적)
interface GetPublishedPostsOptions {
  tag?: string;
}

export async function getPublishedPosts(
  options?: GetPublishedPostsOptions
): Promise<NotionPost[]> {
  try {
    const posts = await getAllPosts();

    if (options?.tag) {
      return posts.filter((post) => post.tags.includes(options.tag!));
    }

    return posts;
  } catch (error: any) {
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 게시 포스트 조회 실패:`, notionError.message);
    throw notionError;
  }
}

// getPostBySlug 함수 (Phase 3.1에서 구현)
// Slug 기반 포스트 조회
export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  try {
    const posts = await getAllPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      console.warn(`[Notion API] 포스트 slug '${slug}' 없음`);
      return null;
    }

    return post;
  } catch (error: any) {
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 포스트 조회 실패:`, notionError.message);
    throw notionError;
  }
}

// getPostBlocks 함수 (Phase 3.1에서 구현)
// 포스트 페이지의 블록 데이터 조회
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  try {
    const blocks: NotionBlock[] = [];
    let cursor: string | undefined = undefined;

    // 페이지의 모든 블록 조회 (페이지네이션 처리)
    while (true) {
      const response: any = await (notion.blocks.children as any).list({
        block_id: pageId,
        page_size: 100,
        start_cursor: cursor,
      });

      for (const block of response.results) {
        const blockData = block as any;
        const notionBlock: NotionBlock = {
          id: blockData.id,
          type: blockData.type,
          content: blockData,
          parentId: pageId,
        };

        // 자식 블록이 있으면 재귀적으로 조회
        if (blockData.has_children) {
          notionBlock.children = await getPostBlocks(blockData.id);
        }

        blocks.push(notionBlock);
      }

      if (!response.has_more) break;
      cursor = response.next_cursor ?? undefined;
    }

    console.log(`[Notion API] 페이지 ${pageId}의 블록 ${blocks.length}개 조회됨`);
    return blocks;
  } catch (error: any) {
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 블록 조회 실패:`, notionError.message);
    throw notionError;
  }
}
