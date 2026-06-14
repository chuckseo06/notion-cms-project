// 포스트 상세 페이지
// 동적 라우트: /posts/[slug]
// generateStaticParams로 빌드 시 정적 생성, ISR로 최신 상태 유지

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts, getPostBySlug, getPostBlocks } from "@/lib/notion";
import { NotionRenderer } from "@/components/blog/NotionRenderer";
import { Badge } from "@/components/ui/badge";

// ISR 재검증 주기: 1시간
export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 빌드 시 정적 경로 생성
 * 모든 Published 포스트의 slug를 미리 생성합니다.
 * Notion API 미설정 시 빈 배열 반환 (ISR로 런타임 생성)
 */
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    // 빌드 시점에 Notion API 미설정이면 빈 배열 반환
    // 요청 시 ISR로 페이지가 동적 생성됩니다.
    return [];
  }
}

/**
 * 동적 OG 메타태그 생성
 * 포스트 제목, 요약, 커버 이미지를 사용합니다.
 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "포스트를 찾을 수 없습니다" };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      tags: post.tags,
      ...(post.coverImage && {
        images: [
          {
            url: post.coverImage,
            alt: post.title,
          },
        ],
      }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // 포스트 메타데이터 조회
  const post = await getPostBySlug(slug);

  // 미게시 또는 존재하지 않는 포스트 → 404
  if (!post) {
    notFound();
  }

  // 포스트 본문 블록 조회
  const blocks = await getPostBlocks(post.id);

  // 게시 날짜 포맷
  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <article className="container mx-auto max-w-3xl px-4 py-10">
      {/* 뒤로 가기 */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← 목록으로
      </Link>

      {/* 커버 이미지 히어로 */}
      {post.coverImage && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* 포스트 메타정보 */}
      <header className="mb-8">
        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* 제목 */}
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        {/* 날짜 */}
        {formattedDate && (
          <time
            dateTime={post.publishedAt ?? undefined}
            className="mt-3 block text-sm text-muted-foreground"
          >
            {formattedDate}
          </time>
        )}
      </header>

      {/* 구분선 */}
      <hr className="mb-8 border-border" />

      {/* 본문 */}
      <NotionRenderer blocks={blocks} />
    </article>
  );
}
