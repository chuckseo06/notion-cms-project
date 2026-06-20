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
export const notion = new Client({ auth: NOTION_API_KEY });

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

// 헬퍼 함수: 텍스트 속성 추출
export function extractText(property: any): string {
  if (!property || property.type !== "title") {
    return "";
  }
  const richTextArray = property.title || [];
  return richTextArray.map((item: any) => item.plain_text).join("");
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
export function parsePost(page: PageObjectResponse): NotionPost | null {
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
export async function getAllPosts(): Promise<NotionPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
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

    const posts: NotionPost[] = [];
    for (const page of response.results) {
      const post = parsePost(page as PageObjectResponse);
      if (post) {
        posts.push(post);
      }
    }

    console.log(`[Notion API] 포스트 ${posts.length}개 조회됨`);
    return posts;
  } catch (error: any) {
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 포스트 조회 실패:`, notionError.message);
    throw notionError;
  }
}
