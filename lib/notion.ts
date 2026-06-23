import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionPost, NotionBlock, NotionPostSchema } from "@/types/notion";

// 환경 변수 로드 및 검증
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

/**
 * 환경 변수 검증
 * 애플리케이션 초기화 시 필수 설정이 있는지 확인합니다.
 */
function validateEnvironment(): void {
  const errors: string[] = [];

  if (!NOTION_API_KEY) {
    errors.push(
      "[설정 오류] NOTION_API_KEY 환경 변수가 설정되지 않았습니다. " +
      ".env.local에 NOTION_API_KEY=secret_xxxxx 형식으로 추가하세요."
    );
  } else if (NOTION_API_KEY.length < 10) {
    errors.push(
      "[설정 오류] NOTION_API_KEY가 너무 짧습니다. " +
      "유효한 Notion API 토큰인지 확인하세요."
    );
  }

  if (!NOTION_DATABASE_ID) {
    errors.push(
      "[설정 오류] NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. " +
      ".env.local에 NOTION_DATABASE_ID=xxxxx 형식으로 추가하세요."
    );
  } else if (NOTION_DATABASE_ID.length < 20) {
    errors.push(
      "[설정 오류] NOTION_DATABASE_ID가 너무 짧습니다. " +
      "유효한 Notion Database ID인지 확인하세요."
    );
  }

  if (errors.length > 0) {
    const fullMessage = errors.join("\n");
    console.error("[Notion API] 초기화 실패:\n" + fullMessage);
    throw new Error(fullMessage);
  }

  console.log("[Notion API] ✅ 환경 변수 검증 완료");
}

// 서버 측에서만 검증 (클라이언트 사이드 체크)
if (typeof window === "undefined") {
  validateEnvironment();
}

// Notion 클라이언트 초기화 (싱글톤 패턴)
// baseUrl 옵션 제거 (SDK에서 자동으로 처리)
export const notion = new Client({
  auth: NOTION_API_KEY,
});

// Rate Limiting 설정
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1초

/**
 * Notion API 요청에 대한 재시도 로직 (Exponential Backoff)
 * 429 (Rate Limit) 에러에 대해 자동으로 재시도합니다.
 *
 * @param fn 실행할 비동기 함수
 * @param retries 남은 재시도 횟수
 * @returns 함수 실행 결과
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // 429 에러이고 재시도 남아있으면 재시도
    if (error.status === 429 && retries > 0) {
      // Exponential backoff: 1초, 2초, 4초
      const delay = INITIAL_DELAY * Math.pow(2, MAX_RETRIES - retries);
      const retriesLeft = retries - 1;
      console.warn(
        `[Notion API] Rate limit 초과. ${delay}ms 후 재시도... (남은 시도: ${retriesLeft})`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retriesLeft);
    }
    throw error;
  }
}

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
/**
 * Notion API 에러 처리 및 사용자 친화적 메시지 생성
 * 에러 코드별로 명확한 해결 방법을 제시합니다.
 */
export function handleNotionError(error: any): NotionAPIError {
  const errorCode = error.status || error.code || "UNKNOWN";
  const errorMessage = error.message || "알 수 없는 오류";

  // 401: 인증 오류
  if (error.status === 401) {
    console.error(
      "[Notion API] 401 Unauthorized: API Key가 유효하지 않습니다. " +
      "Notion 통합 설정에서 토큰을 재생성해보세요."
    );
    return new NotionAPIError(
      "UNAUTHORIZED",
      "❌ Notion API 인증 오류\n\n" +
      "해결 방법:\n" +
      "1. .env.local의 NOTION_API_KEY 값이 올바른지 확인하세요\n" +
      "2. 토큰이 만료되었다면 https://www.notion.so/my-integrations에서 재생성하세요\n" +
      "3. 로컬 서버를 재시작하세요"
    );
  }

  // 403: 권한 오류
  if (error.status === 403) {
    console.error(
      "[Notion API] 403 Forbidden: Integration이 Database에 공유되지 않았습니다. " +
      `Database ID: ${NOTION_DATABASE_ID}`
    );
    return new NotionAPIError(
      "FORBIDDEN",
      "❌ Notion Database 접근 권한 오류\n\n" +
      "해결 방법:\n" +
      "1. Notion에서 해당 Database를 엽니다\n" +
      "2. 우상단 공유 버튼 클릭\n" +
      "3. 'Invite'에서 'Blog CMS' Integration을 검색해 추가하세요\n" +
      "4. 로컬 서버를 재시작하세요"
    );
  }

  // 404: 리소스 없음
  if (error.status === 404) {
    console.error(
      "[Notion API] 404 Not Found: Database를 찾을 수 없습니다. " +
      `Database ID: ${NOTION_DATABASE_ID}`
    );
    return new NotionAPIError(
      "NOT_FOUND",
      "❌ Notion Database를 찾을 수 없습니다\n\n" +
      "해결 방법:\n" +
      "1. .env.local의 NOTION_DATABASE_ID가 정확한지 확인하세요\n" +
      "2. Notion에서 해당 Database가 존재하는지 확인하세요\n" +
      "3. Database URL에서 ID를 복사해 다시 확인하세요\n" +
      "4. 올바른 값으로 수정 후 서버를 재시작하세요"
    );
  }

  // 429: Rate Limit
  if (error.status === 429) {
    console.warn(
      "[Notion API] 429 Rate Limited: API 호출 제한 초과. " +
      "자동 재시도 로직이 활성화되어 있습니다."
    );
    return new NotionAPIError(
      "RATE_LIMIT",
      "⚠️ Notion API Rate Limit 초과\n\n" +
      "해결 방법:\n" +
      "- 시스템이 자동으로 재시도합니다 (최대 3회)\n" +
      "- 계속 오류가 발생하면 몇 분 후 다시 시도하세요\n" +
      "- Notion API는 3req/sec 제한이 있습니다"
    );
  }

  // 500+: 서버 오류
  if (error.status && error.status >= 500) {
    console.error(
      `[Notion API] ${error.status} Server Error: Notion 서버에 일시적 문제가 있습니다.`
    );
    return new NotionAPIError(
      "SERVER_ERROR",
      `❌ Notion 서버 오류 (HTTP ${error.status})\n\n` +
      "해결 방법:\n" +
      "- Notion 상태 페이지 확인: https://status.notion.so\n" +
      "- 몇 분 후 다시 시도하세요"
    );
  }

  // 기타 에러
  console.error(
    `[Notion API] 예상 외 오류 (${errorCode}): ${errorMessage}`
  );
  return new NotionAPIError(
    errorCode,
    `❌ Notion API 오류: ${errorMessage}\n\n` +
    "자세한 내용:\n" +
    `- 에러 코드: ${errorCode}\n` +
    `- 상태: ${error.status || "N/A"}\n` +
    "개발자 콘솔을 확인하세요."
  );
}

// parsePost 함수 (Phase 1.3.4에서 구현)
/**
 * Notion Page 객체를 NotionPost로 변환하고 Zod 스키마로 검증합니다.
 * 검증 실패 시 상세한 에러 정보를 로깅합니다.
 */
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

    // 기본 필드 검증 (필수 필드가 있는지 확인)
    if (!title || !slug || !publishedAt) {
      console.warn(
        `[Notion API] 포스트 파싱 오류 (필수 필드 누락): 포스트 ID: ${page.id}, ` +
        `title: ${title ? "✓" : "✗"}, slug: ${slug ? "✓" : "✗"}, ` +
        `publishedAt: ${publishedAt ? "✓" : "✗"}`
      );
      return null;
    }

    // 파싱된 데이터 생성
    const post = {
      id: page.id,
      slug,
      title,
      publishedAt,
      tags,
      excerpt,
      coverImage,
      isPublished,
    };

    // Zod 스키마로 런타임 검증
    const validationResult = NotionPostSchema.safeParse(post);

    if (!validationResult.success) {
      // 검증 실패 - 상세 에러 정보 로깅
      const errorSummary = validationResult.error.issues
        .map(err => `필드 '${err.path.join(".")}': ${err.message}`)
        .join("; ");

      console.error(
        `[Notion API] 포스트 검증 실패 (ID: ${page.id}): ${errorSummary}`
      );
      return null;
    }

    // 검증 성공
    console.debug(
      `[Notion API] 포스트 검증 성공: ${post.title} (slug: ${post.slug})`
    );
    return validationResult.data;
  } catch (error) {
    console.error(
      `[Notion API] 포스트 ${page.id} 파싱 중 예상 외 오류:`,
      error instanceof Error ? error.message : error
    );
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

    // Step 1: Database 메타데이터 조회 (data_source_id 추출용) - withRetry 적용
    const databaseInfo = await withRetry(() =>
      notion.databases.retrieve({
        database_id: NOTION_DATABASE_ID!,
      })
    );

    // data_sources 배열에서 첫 번째 data source ID 추출
    const dataSourceId = (databaseInfo as any).data_sources?.[0]?.id;
    if (!dataSourceId) {
      throw new Error(
        "Database에서 data_source_id를 찾을 수 없습니다. Database가 올바르게 설정되었는지 확인하세요."
      );
    }

    console.log(`[Notion API] data_source_id: ${dataSourceId}`);
    console.log(`[Notion API] dataSources.query() 호출 시작...`);

    // Step 2: dataSources.query() 호출 (올바른 data_source_id 사용) - withRetry 적용
    const response = await withRetry(() =>
      notion.dataSources.query({
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
      })
    );

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
/**
 * 주어진 slug로 포스트를 조회합니다.
 * 포스트가 없거나 미게시(Published=false)이면 null을 반환합니다.
 */
export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  try {
    console.log(`[Notion API] 포스트 조회 시작: slug='${slug}'`);

    const posts = await getAllPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      console.warn(
        `[Notion API] ⚠️ 포스트 미발견: slug='${slug}' (가능한 원인: 잘못된 slug, 미게시 상태)`
      );
      return null;
    }

    if (!post.isPublished) {
      console.warn(
        `[Notion API] ⚠️ 포스트 미게시: slug='${slug}', title='${post.title}'`
      );
      return null;
    }

    console.log(
      `[Notion API] ✅ 포스트 조회 성공: title='${post.title}', slug='${slug}'`
    );
    return post;
  } catch (error: any) {
    console.error(
      `[Notion API] 포스트 조회 중 오류: slug='${slug}', 에러:`,
      error
    );
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 상세: ${notionError.message}`);
    throw notionError;
  }
}

/**
 * 포스트 페이지의 모든 블록을 재귀적으로 조회합니다.
 * 자식 블록(has_children=true)도 함께 조회됩니다.
 */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  try {
    console.debug(`[Notion API] 블록 조회 시작: pageId='${pageId}'`);

    const blocks: NotionBlock[] = [];
    let cursor: string | undefined = undefined;
    let pageIndex = 0;

    // 페이지의 모든 블록 조회 (페이지네이션 처리) - withRetry 적용
    while (true) {
      console.debug(
        `[Notion API] 블록 페이지 ${pageIndex} 조회 중: pageId='${pageId}'`
      );

      const response: any = await withRetry(() =>
        (notion.blocks.children as any).list({
          block_id: pageId,
          page_size: 100,
          start_cursor: cursor,
        })
      );

      const batchBlockCount = response.results?.length || 0;
      console.debug(
        `[Notion API] 블록 배치 수신: ${batchBlockCount}개 (pageId='${pageId}')`
      );

      for (const block of response.results) {
        const blockData = block as any;
        const blockType = blockData.type;
        const hasChildren = blockData.has_children ? "자식 있음" : "자식 없음";

        // BlockRenderer가 기대하는 구조로 변환
        // { type, paragraph?: {...}, heading_1?: {...}, ... }
        const notionBlock: NotionBlock = {
          id: blockData.id,
          type: blockType,
          content: blockData,
          parentId: pageId,
          // 블록 타입별 데이터를 직접 추가 (BlockRenderer 호환성)
          [blockType]: blockData[blockType],
        } as any;

        // 자식 블록이 있으면 재귀적으로 조회
        if (blockData.has_children) {
          console.debug(
            `[Notion API] 자식 블록 조회 중: 타입='${blockType}', ` +
            `부모='${pageId}'`
          );
          notionBlock.children = await getPostBlocks(blockData.id);
        }

        blocks.push(notionBlock);
      }

      if (!response.has_more) break;
      cursor = response.next_cursor ?? undefined;
      pageIndex++;
    }

    // 블록 타입별 통계
    const blockTypeStats = blocks.reduce(
      (acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const typesSummary = Object.entries(blockTypeStats)
      .map(([type, count]) => `${type}(${count})`)
      .join(", ");

    console.log(
      `[Notion API] ✅ 블록 조회 완료: ` +
      `pageId='${pageId}', 총 ${blocks.length}개 ` +
      `(${typesSummary})`
    );

    return blocks;
  } catch (error: any) {
    console.error(
      `[Notion API] 블록 조회 실패: pageId='${pageId}', 에러:`,
      error
    );
    const notionError = handleNotionError(error);
    console.error(`[Notion API] 상세: ${notionError.message}`);
    throw notionError;
  }
}
