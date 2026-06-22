// 홈 페이지 — 포스트 목록 및 태그 필터
// Server Component로 Notion DB에서 포스트를 가져옵니다.
// ISR: 1시간마다 자동 재검증 (배포 없이 새 포스트 반영)

import { Suspense } from "react";
import { getPublishedPosts, getAllTags } from "@/lib/notion";
import { PostCard } from "@/components/blog/PostCard";
import { TagFilter } from "@/components/blog/TagFilter";

// ISR 재검증 주기: 3600초 (1시간)
export const revalidate = 3600;

interface HomePageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag: selectedTag } = await searchParams;

  // 병렬로 포스트 목록 및 태그 목록 조회
  // Notion API 미설정 시 빈 배열로 폴백
  const [posts, allTags] = await Promise.all([
    getPublishedPosts({ tag: selectedTag }).catch(() => []),
    getAllTags().catch(() => []),
  ]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 bg-background min-h-screen">
      {/* 페이지 헤더 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedTag ? `#${selectedTag}` : "모든 글"}
        </h1>
        {selectedTag && (
          <p className="mt-1 text-muted-foreground">
            {posts.length}개의 글
          </p>
        )}
      </section>

      {/* 태그 필터 (클라이언트 컴포넌트, Suspense로 감싸야 useSearchParams 동작) */}
      <Suspense fallback={null}>
        <div className="mb-8">
          <TagFilter tags={allTags} selectedTag={selectedTag} />
        </div>
      </Suspense>

      {/* 포스트 목록 */}
      {posts.length === 0 ? (
        // 빈 상태 메시지
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">아직 게시된 글이 없습니다.</p>
          {selectedTag && (
            <p className="mt-1 text-sm">
              #{selectedTag} 태그의 글이 없습니다.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
